<script setup lang="ts">
import type { MaybeRefOrGetter } from "vue";
import type { SyncCookie } from "@/lib/type";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import { Alert, AlertDescription } from "#/ui/alert";
import { Button } from "#/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#/ui/dialog";
import { Input } from "#/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "#/ui/select";
import { Textarea } from "#/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useQuery } from "@tanstack/vue-query";
import { pick, sortBy } from "es-toolkit";
import { computed, ref, toValue } from "vue";
import { toast } from "vue-sonner";
import { cn } from "@/lib/utils";

const list = defineModel<SyncCookie[]>("list", {
  required: true,
});

const field = defineModel<SyncCookie>("field", {
  required: true,
});

const { index } = defineProps<{
  index: number;
}>();

function useCookiesQuery(domainComplex: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ["cookies", domainComplex],
    queryFn: async () => {
      const domain = toValue(domainComplex);
      if (domain.trim() === "") {
        return [];
      }
      const cookies = await browser.cookies.getAll({ domain });

      return cookies.filter(
        cookie => cookie.domain === domain || cookie.domain === `.${domain}`,
      ).map(cookie => pick(cookie, ["name", "value", "path", "domain"]));
    },
  });
}

const { data: cookies, isPending } = useCookiesQuery(() => field.value.domain);
const getCookieKey = (c: Pick<SyncCookie, "name" | "path" | "domain">) => `${c.domain}|${c.path}|${c.name}`;
function createOption(cookie: Pick<SyncCookie, "name" | "value" | "path" | "domain">) {
  return {
    value: getCookieKey(cookie),
    label: cookie.name,
    cookieValue: cookie.value,
    path: cookie.path,
    domain: cookie.domain,
    isMissing: false,
  };
}
const cookieOptions = computed(() => {
  if (isPending.value) {
    return [];
  }

  const options = cookies.value?.map(createOption) ?? [];
  const currentKey = getCookieKey(field.value);

  if (field.value.name && !options.find(option => option.value === currentKey)) {
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

const isCookieDialogOpen = ref(false);

const disabled = computed(() => {
  return (cookies.value?.length ?? 0) === 0 || isPending.value;
});

function updateCookie(newKey: string) {
  const selected = cookieOptions.value.find(cookie => cookie.value === newKey);
  if (selected) {
    field.value.value = selected.cookieValue;
    field.value.domain = selected.domain;
    field.value.name = selected.label;
    field.value.path = selected.path;
  }
}

const selectedCookieOption = computed(() => {
  const currentKey = getCookieKey(field.value);
  return cookieOptions.value.find((cookie) => {
    return cookie.value === currentKey;
  });
});

const groupedCookieOptions = computed(() => {
  return Object.groupBy(cookieOptions.value, option => `${option.domain}${option.path}`);
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
    <div class="flex flex-1 items-center gap-1">
      <slot name="field-before" />
      <div class="grid flex-1 grid-cols-2 gap-1">
        <Input
          :model-value="field.domain"
          placeholder="Domain"
          class="
            text-base
            placeholder:italic
          "
          @change="handleDomainChange"
        />
        <div class="relative">
          <Select
            :model-value="getCookieKey(field)"
            :disabled="disabled || isPending"
            @update:model-value="(v) => updateCookie(v)"
          >
            <SelectTrigger
              :class="cn(
                'w-full min-w-0 px-3 text-base',
                selectedCookieOption?.isMissing && 'border-warning text-warning',
              )"
            >
              <div
                v-if="isPending"
                class="h-4 w-20 animate-pulse rounded-sm bg-muted"
              />
              <SelectValue
                v-else
                :placeholder="disabled ? 'Not available' : 'Pick a cookie'"
                class="block! flex-1 truncate text-left"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup
                v-for="(options, domain) in groupedCookieOptions"
                :key="domain"
              >
                <SelectLabel>{{ domain }}</SelectLabel>
                <SelectItem
                  v-for="option in options"
                  :key="option.value"
                  :value="option.value"
                >
                  <div
                    :class="cn('flex items-center gap-1', option.isMissing ? `
                      text-warning
                    ` : '')"
                  >
                    <span class="max-w-50 truncate">
                      {{ option.label }}
                    </span>
                    <span
                      v-if="option.isMissing"
                    >
                      (Missing)
                    </span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
    <div class="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon-xs"
              :disabled="refreshButtonDisabled"
              @click="refreshCookie"
            >
              <i class="i-lucide-rotate-ccw size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" :collision-padding="5">
            Refresh to get the latest cookie
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button
        variant="ghost"
        size="icon-xs"
        class="text-destructive!"
        @click="() => {
          list.splice(index, 1);
        }"
      >
        <span class="sr-only">Delete this header mod</span>
        <i class="i-lucide-x size-4" />
      </Button>
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
              @click="() => isCookieDialogOpen = true"
            >
              <i class="i-lucide-eye-off size-4" />
              View Cookie
            </button>
          </li>
        </template>
      </ActionsDropdown>
    </div>
  </div>

  <Dialog v-model:open="isCookieDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>View Cookie</DialogTitle>
      </DialogHeader>

      <Alert variant="warning">
        <i class="i-lucide-triangle-alert size-4" />
        <AlertDescription>
          Warning: Sharing cookies with others may result in the leakage of login credentials!
        </AlertDescription>
      </Alert>

      <Textarea
        class="mt-2 min-h-24 w-full text-base wrap-anywhere select-all"
        placeholder="Comments"
        disabled
        :value="field.value"
      />
    </DialogContent>
  </Dialog>
</template>
