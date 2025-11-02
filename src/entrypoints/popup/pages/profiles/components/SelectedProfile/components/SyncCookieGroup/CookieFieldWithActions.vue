<script setup lang="ts">
import type { MaybeRefOrGetter } from "vue";
import type { SyncCookie } from "@/lib/type";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useQuery } from "@tanstack/vue-query";
import { pick } from "es-toolkit";
import { computed, toValue, useTemplateRef } from "vue";
import { toast } from "vue-sonner";
import { cn } from "@/lib/utils";

const { index } = defineProps<{
  index: number;
}>();

const list = defineModel<SyncCookie[]>("list", {
  required: true,
});

const field = defineModel<SyncCookie>("field", {
  required: true,
});

function useCookiesQuery(domain: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ["cookies", domain],
    queryFn: async () => {
      const cookies = await browser.cookies.getAll({ domain: toValue(domain) });
      // Filter cookies that match the exact domain or are subdomains
      const targetDomain = toValue(domain);
      return cookies.filter(cookie =>
        cookie.domain === targetDomain
        || cookie.domain === `.${targetDomain}`,
      )
        .map(cookie => ({ ...pick(cookie, ["name", "value", "path"]), isMissing: false }))
      ;
    },
    enabled: Boolean(domain),
  });
}

const { data: cookies, isPending } = useCookiesQuery(() => field.value.domain);

const isCookieValid = computed(() => {
  if (!field.value.name || !cookies.value) {
    return true;
  }
  return cookies.value.some(cookie => cookie.name === field.value.name);
});

const displayCookies = computed(() => {
  if (!cookies.value)
    return [];

  if (isCookieValid.value) {
    return cookies.value;
  }

  if (field.value.name) {
    const missingCookie = {
      name: field.value.name,
      value: field.value.value,
      path: field.value.path,
      isMissing: true,
    };
    return [missingCookie, ...cookies.value];
  }

  return cookies.value;
});

function handleNameChange(e: Event) {
  const name = (e.target as HTMLSelectElement).value;
  const selectedCookie = displayCookies.value?.find(cookie => cookie.name === name);
  if (selectedCookie && !selectedCookie.isMissing) {
    field.value.value = selectedCookie.value;
    field.value.path = selectedCookie.path;
  }
}

function handleDomainChange(e: Event) {
  field.value.domain = (e.target as HTMLInputElement).value;
  field.value.name = "";
  field.value.value = "";
}

async function refreshCookie() {
  const cookie = await browser.cookies.get({
    name: field.value.name,
    url: `https://${field.value.domain}${field.value.path}`,
  });
  if (cookie) {
    field.value.value = cookie.value;
    toast.success("Cookie refreshed successfully.");
  } else {
    toast.error("The cookie was not found. It may no longer exist.");
  }
}

const cookieDialogRef = useTemplateRef("cookieDialogRef");

const refreshButtonDisabled = computed(() => {
  return !field.value.name || isPending.value || !isCookieValid.value
    || displayCookies.value.some(cookie =>
      cookie.path === field.value.path
      && cookie.name === field.value.name
      && cookie.value === field.value.value,
    );
});
</script>

<template>
  <div class="flex flex-1 items-center justify-between gap-1">
    <label class="label flex flex-1">
      <slot name="field-before" />
      <div class="flex flex-1 gap-1">
        <label class="flex-1">
          <input
            :value="field.domain"
            type="text"
            placeholder="Domain"
            class="
              input input-sm w-full text-base text-base-content
              placeholder:italic
            "
            @change="handleDomainChange"
          >
        </label>
        <label class="relative flex-1">
          <select
            v-model="field.name"
            :disabled="displayCookies.length === 0 || isPending"
            :class="cn(
              'select select-sm text-base',
              Boolean(field.value) && 'text-base-content',
              !isCookieValid && field.name && 'text-warning select-warning',
            )"
            @change="handleNameChange"
          >
            <option
              value="" disabled class="font-medium text-base-content/66 italic"
            >
              {{ displayCookies.length > 0 ? "Pick a cookie" : "No available" }}
            </option>
            <option
              v-for="cookie in displayCookies"
              :key="cookie.name"
              :value="cookie.name"
              :class="cn(
                cookie.isMissing ? 'text-warning' : 'text-base-content',
              )"
            >
              {{ cookie.name }}{{ cookie.isMissing ? ' (Missing)' : '' }}
            </option>
          </select>
        </label>
      </div>
    </label>
    <div class="flex gap-0.5">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              :disabled="refreshButtonDisabled"
              class="btn btn-square btn-soft btn-xs btn-primary"
              @click="refreshCookie"
            >
              <i class="i-lucide-rotate-ccw size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" :collision-padding="5">
            Refresh to get the latest cookie
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button
        class="btn btn-square btn-ghost btn-xs btn-error"
        @click="() => {
          list.splice(index, 1);
        }"
      >
        <span class="sr-only">Delete this header mod</span>
        <i class="i-lucide-x size-4" />
      </button>
      <ActionsDropdown
        v-model:list="list"
        v-model:field="field"
        :index
      >
        <template #buttons-before>
          <li>
            <button
              class="
                flex
                disabled:pointer-events-none disabled:opacity-60
              "
              :disabled="!field.value"
              @click="() => cookieDialogRef?.showModal()"
            >
              <i class="i-lucide-eye-off size-4" />
              View Cookie
            </button>
          </li>
        </template>
      </ActionsDropdown>
    </div>
  </div>
  <dialog ref="cookieDialogRef" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-semibold">
        View Cookie
      </h3>
      <div role="alert" class="mt-4 alert alert-soft alert-warning">
        <i class="i-lucide-triangle-alert size-6" />
        <span>Warning: Sharing cookies with others may result in the leakage of login credentials!</span>
      </div>
      <textarea
        class="textarea mt-2 min-h-24 w-full text-base wrap-anywhere select-all"
        placeholder="Comments"
        disabled
        :value="field.value"
      />
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-soft">
            Close
          </button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>
        <span class="sr-only">Close</span>
      </button>
    </form>
  </dialog>
</template>
