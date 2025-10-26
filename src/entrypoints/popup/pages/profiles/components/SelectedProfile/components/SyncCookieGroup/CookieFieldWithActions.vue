<script setup lang="ts">
import type { MaybeRefOrGetter } from "vue";
import type { SyncCookie } from "@/lib/storage";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useQuery } from "@tanstack/vue-query";
import { pick } from "es-toolkit";
import { ref, toValue } from "vue";
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
      // Filter sub-domain cookies
      return cookies.filter(cookie => cookie.domain === `.${toValue(domain)}`)
        .map(cookie => pick(cookie, ["name", "value", "path"]))
      ;
    },
    enabled: Boolean(domain),
  });
}

const { data: cookies, isPending } = useCookiesQuery(() => field.value.domain);

function handleNameChange(e: Event) {
  const name = (e.target as HTMLSelectElement).value;
  const selectedCookie = cookies.value?.find(cookie => cookie.name === name);
  if (selectedCookie) {
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

const cookieDialogRef = ref<HTMLDialogElement | null>(null);
</script>

<template>
  <div class="flex flex-1 items-center justify-between gap-1">
    <label class="label flex flex-1">
      <slot name="field-before" />
      <div class="flex flex-1 gap-1">
        <label class="floating-label flex-1">
          <span>Domain</span>
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
        <label class="floating-label relative flex-1">
          <span>Name</span>
          <select
            v-model="field.name"
            :disabled="cookies == null || cookies.length === 0 || isPending"
            :class="cn(
              'select select-sm text-base',
              Boolean(field.value) && 'text-base-content',
            )"
            @change="handleNameChange"
          >
            <div class="max-h-[calc(100dvh_/_2_-_1rem)]">
              <option value="" disabled>
                {{ cookies && cookies.length > 0 ? "Pick a cookie" : "No available" }}
              </option>
              <option
                v-for="cookie in cookies"
                :key="cookie.name"
                :value="cookie.name"
              >
                {{ cookie.name }}
              </option>
            </div>
          </select>
        </label>
      </div>
    </label>
    <div class="flex gap-0.5">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              :disabled="field.name === ''"
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
          <li v-if="field.value">
            <button class="flex" @click="() => cookieDialogRef?.showModal()">
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
      <h3 class="text-lg font-bold">
        View Cookie
      </h3>
      <div role="alert" class="mt-4 alert alert-soft alert-warning">
        <svg
          xmlns="http://www.w3.org/2000/svg" class="
            size-6 shrink-0 stroke-current
          " fill="none" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Warning: Sharing cookies with others may result in the leakage of login credentials!</span>
      </div>
      <div
        class="textarea mt-2 h-24 w-full text-base wrap-anywhere select-all"
        placeholder="Comments"
      >
        {{ field.value }}
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-sm">
            Confirm
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>
