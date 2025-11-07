<script setup lang="ts">
import type { UUID } from "node:crypto";
import type { MaybeRefOrGetter } from "vue";
import type { SyncCookie } from "@/lib/type";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Select from "#/components/select/Select.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useQuery } from "@tanstack/vue-query";
import { isEqual, pick, sortBy } from "es-toolkit";
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
    queryKey: ["cookies", domain, field.value],
    queryFn: async () => {
      const cookies = await browser.cookies.getAll({ domain: toValue(domain) });

      return cookies.filter(
        cookie => cookie.domain === toValue(domain) || cookie.domain === `.${toValue(domain)}`,
      ).map((cookie) => {
        const isSelected = isEqual(pick(cookie, ["domain", "path", "name"]), pick(field.value, ["domain", "path", "name"]));
        return {
          ...pick(cookie, ["name", "value", "path", "domain"]),
          id: isSelected ? field.value.id : crypto.randomUUID(),
        };
      })
      ;
    },
    enabled: Boolean(domain),
  });
}

const { data: cookies, isPending } = useCookiesQuery(() => field.value.domain);

const cookieOptions = computed(() => {
  if (isPending.value) {
    return [];
  }
  function createOption(cookie: Pick<SyncCookie, "id" | "name" | "value" | "path" | "domain">) {
    return {
      value: cookie.id,
      label: cookie.name,
      cookieValue: cookie.value,
      path: cookie.path,
      domain: cookie.domain,
      isMissing: false,
    };
  }
  const options = cookies.value?.map(createOption) ?? [];
  if (!options.find(
    option =>
      option.value === field.value.id,
  ) && field.value.value) {
    options.push({
      ...createOption(field.value),
      isMissing: true,
    });
  }

  return sortBy(options, ["label", "domain", "path"]);
});

function handleDomainChange(e: Event) {
  const userInput = (e.target as HTMLInputElement).value;
  try {
    const url = new URL(userInput);
    field.value.domain = url.hostname;
  } catch {
    field.value.domain = (e.target as HTMLInputElement).value;
  }
  field.value.name = "";
  field.value.value = "";
  field.value.path = "";
}

const cookieDialogRef = useTemplateRef("cookieDialogRef");

const disabled = computed(() => {
  return cookieOptions.value.length === 0 || isPending.value;
});

function updateCookie(newCookieId: UUID) {
  const selected = cookieOptions.value.find(cookie => cookie.value === newCookieId);
  if (selected) {
    field.value.value = selected.cookieValue;
    field.value.domain = selected.domain;
    field.value.name = selected.label;
    field.value.path = selected.path;
  }
}

const selectedCookieOption = computed(() => {
  return cookieOptions.value.find((cookie) => {
    return cookie.value === field.value.id;
  });
});

const refreshButtonDisabled = computed(() => {
  return !field.value.name
    || isPending.value
    || selectedCookieOption.value?.isMissing
    || cookieOptions.value.length === 0
    || selectedCookieOption.value?.cookieValue === field.value.value;
});

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
</script>

<template>
  <div class="flex flex-1 items-center justify-between gap-1">
    <label class="label flex flex-1">
      <slot name="field-before" />
      <div class="grid flex-1 grid-cols-2 gap-1">
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
        <label class="relative">
          <Select
            v-model="field.id"
            :options="cookieOptions"
            :disabled
            :placeholder="disabled ? 'No available' : 'Pick a cookie'"
            class="w-full select-sm text-base"
            :type="selectedCookieOption?.isMissing ? 'warning' : 'normal'"
            :loading="isPending"
            @change="(v) => updateCookie(v)"
          >
            <template #label="{ option }">
              <div :class="cn('flex gap-1', option.isMissing ? 'text-warning' : '')">
                <span class="max-w-50 truncate">
                  {{ option.label }}
                </span>
                <span
                  v-if="option.isMissing"
                >
                  (Missing)
                </span>
                <TooltipProvider :delay-duration="200">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button class="btn btn-square btn-ghost btn-xs btn-info">
                        <i
                          class="i-lucide-circle-question-mark size-4"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      :collision-padding="20"
                      side="top"
                      class="
                        prose prose-sm flex max-h-40 w-full max-w-lg
                        overflow-y-auto text-base-content
                      "
                    >
                      <span>{{ `Domain: ${option.domain} - Path: ${option.path}` }}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </template>
          </Select>
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
