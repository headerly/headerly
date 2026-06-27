<script setup lang="ts">
import type { MaybeRefOrGetter } from "vue";
import type { SyncCookie } from "@/lib/schema";
import { useQuery } from "@tanstack/vue-query";
import { pick, sortBy } from "es-toolkit";
import { computed, ref, toValue } from "vue";
import { useI18n } from "vue-i18n";
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

const { t } = useI18n();

function useCookiesQuery(domainComplex: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ["cookies", domainComplex],
    queryFn: async () => {
      const domain = toValue(domainComplex);
      if (domain.trim() === "") {
        return [];
      }
      const cookies = await browser.cookies.getAll({ domain });

      return cookies.filter(cookie => isCookieInDomain(cookie, domain))
        .map(cookie => pick(cookie, ["name", "value", "path", "domain"]));
    },
  });
}

const { data: cookies, isPending } = useCookiesQuery(() => field.value.domain);
const getCookieKey = (c: Pick<SyncCookie, "name" | "path" | "domain">) => `${c.domain}|${c.path}|${c.name}`;

function isCookieInDomain(cookie: Pick<Browser.cookies.Cookie, "domain">, domain: string) {
  return cookie.domain === domain || cookie.domain === `.${domain}`;
}

function createOption(cookie: Pick<SyncCookie, "name" | "value" | "path" | "domain">) {
  return {
    value: getCookieKey(cookie),
    label: cookie.name,
    cookieValue: cookie.value,
    path: cookie.path,
    domain: cookie.domain,
  };
}

const isSelectedCookieMissing = computed(() => {
  return Boolean(field.value.name && field.value.value === "");
});

const cookieOptions = computed(() => {
  if (isPending.value) {
    return [];
  }

  const options = cookies.value?.map(createOption) ?? [];
  const currentKey = getCookieKey(field.value);

  if (field.value.name && !options.some(option => option.value === currentKey)) {
    options.push(createOption(field.value));
  }

  return sortBy(options, ["label", "domain", "path"]);
});

function handleDomainChange(e: Event) {
  const userInput = (e.target as HTMLInputElement).value.trim();
  try {
    const url = new URL(userInput);
    field.value.domain = url.hostname;
  } catch {
    field.value.domain = userInput;
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

const groupedCookieOptions = computed(() => {
  return Object.groupBy(cookieOptions.value, option => `${option.domain}${option.path}`);
});

const missedCookieOptionKey = computed(() => {
  if (field.value.value === "") {
    return getCookieKey(field.value);
  }
  return null;
});
</script>

<template>
  <div
    class="
      flex flex-1 flex-col items-end justify-between gap-1
      sm:flex-row sm:items-center
    "
  >
    <div class="flex w-full flex-1 items-center gap-1">
      <slot name="field-before" />
      <div
        class="
          grid flex-1 grid-rows-2 gap-1
          sm:grid-cols-2 sm:grid-rows-1
        "
      >
        <Input
          :model-value="field.domain"
          :placeholder="t('common.domain')"
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
                isSelectedCookieMissing && 'border-warning text-warning',
              )"
            >
              <div
                v-if="isPending"
                class="h-4 w-20 animate-pulse rounded-sm bg-muted"
              />
              <SelectValue
                v-else
                :placeholder="disabled ? t('common.notAvailable') : t('syncCookie.pickCookie')"
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
                    :class="cn('flex items-center gap-1', option.value === missedCookieOptionKey ? `
                      text-warning
                    ` : '')"
                  >
                    <span class="max-w-50 truncate">
                      {{ option.label }}
                    </span>
                    <span
                      v-if="option.value === missedCookieOptionKey"
                    >
                      {{ t("syncCookie.missing") }}
                    </span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
    <div class="flex gap-0.5">
      <Button
        variant="secondary"
        size="icon-xs"
        :disabled="!field.value"
        @click="() => isCookieDialogOpen = true"
      >
        <span class="sr-only">{{ t("syncCookie.viewCookie") }}</span>
        <i class="i-lucide-eye size-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon-xs"
        @click="() => {
          list.splice(index, 1);
        }"
      >
        <span class="sr-only">{{ t("common.deleteHeaderMod") }}</span>
        <i class="i-lucide-x size-4" />
      </Button>
      <ActionsDropdown
        v-model:list="list"
        v-model:field="field"
        :index
      />
    </div>
  </div>

  <Dialog v-model:open="isCookieDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t("syncCookie.viewCookie") }}</DialogTitle>
      </DialogHeader>

      <Alert variant="warning">
        <i class="i-lucide-triangle-alert size-4" />
        <AlertDescription>
          {{ t("syncCookie.sharingWarning") }}
        </AlertDescription>
      </Alert>

      <Textarea
        v-model="field.value"
        class="min-h-24 w-full text-base wrap-anywhere select-all"
        :placeholder="t('common.comments')"
        disabled
      />
    </DialogContent>
  </Dialog>
</template>
