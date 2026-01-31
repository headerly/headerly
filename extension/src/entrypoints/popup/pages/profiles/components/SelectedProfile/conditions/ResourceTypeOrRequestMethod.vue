<script setup lang="ts" generic="T extends 'resourceTypes' | 'requestMethods' | 'excludedResourceTypes' | 'excludedRequestMethods'">
import type { Filter } from "@/lib/type";
import Fieldset from "#/components/group/Fieldset.vue";
import { Button } from "#/ui/button";
import { Checkbox } from "#/ui/checkbox";
import { Label } from "#/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { difference, inRange } from "es-toolkit";
import { computed } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

const model = defineModel<NonNullable<Filter[T]>>({
  required: true,
});

const { type } = defineProps<{
  type: T;
}>();

const nameMap = {
  resourceTypes: "Resource Types",
  excludedResourceTypes: "Excluded Resource Types",
  requestMethods: "Request Methods",
  excludedRequestMethods: "Excluded Request Methods",
};
const profilesStore = useProfilesStore();

interface ResourceTypeOption {
  value: `${Browser.declarativeNetRequest.ResourceType}`;
  label: string;
}

const resourceTypeOptions = [
  { value: "main_frame", label: "Main Frame" },
  { value: "sub_frame", label: "Sub Frame" },
  { value: "stylesheet", label: "Stylesheet" },
  { value: "script", label: "Script" },
  { value: "image", label: "Image" },
  { value: "font", label: "Font" },
  { value: "object", label: "Object" },
  { value: "xmlhttprequest", label: "XMLHttpRequest" },
  { value: "ping", label: "Ping" },
  { value: "csp_report", label: "CSP Report" },
  { value: "media", label: "Media" },
  { value: "websocket", label: "WebSocket" },
  { value: "webtransport", label: "WebTransport" },
  { value: "webbundle", label: "WebBundle" },
  { value: "other", label: "Other" },
] as const satisfies ResourceTypeOption[];

interface RequestMethodOption {
  value: `${Browser.declarativeNetRequest.RequestMethod}`;
  label: string;
}

const requestMethodsOptions = [
  { value: "connect", label: "CONNECT" },
  { value: "delete", label: "DELETE" },
  { value: "get", label: "GET" },
  { value: "head", label: "HEAD" },
  { value: "options", label: "OPTIONS" },
  { value: "patch", label: "PATCH" },
  { value: "post", label: "POST" },
  { value: "put", label: "PUT" },
  { value: "other", label: "OTHER" },
] as const satisfies RequestMethodOption[];

const optionsMap = {
  resourceTypes: resourceTypeOptions,
  requestMethods: requestMethodsOptions,
  excludedResourceTypes: resourceTypeOptions,
  excludedRequestMethods: requestMethodsOptions,
};

const options = computed(() => optionsMap[type]);

const indeterminate = computed(() => {
  const selectedCount = model.value.length;
  return inRange(selectedCount, 1, options.value.length);
});

const checked = computed(() => {
  return difference(
    options.value.map(option => option.value),
    model.value,
  ).length === 0;
});
</script>

<template>
  <Fieldset
    :name="nameMap[type]"
  >
    <template #main>
      <div class="grid grid-cols-3 gap-y-2">
        <div
          v-for="option in options"
          :key="option.value"
          class="flex items-center gap-2"
        >
          <Checkbox
            :id="option.value"
            :checked="model.includes(option.value)"
            @update:checked="(checked: boolean) => {
              if (checked) {
                model = [...model, option.value] as NonNullable<Filter[T]>;
              } else {
                model = model.filter(v => v !== option.value) as NonNullable<Filter[T]>;
              }
            }"
          />
          <Label :for="option.value" class="font-normal">{{ option.label }}</Label>
        </div>
      </div>
    </template>
    <template #name-before>
      <Checkbox
        :checked
        :indeterminate
        @update:checked="
          (checked: boolean) => {
            if (checked) {
              model = options.map(option => option.value) as NonNullable<Filter[T]>;
            } else {
              model = [];
            }
          }
        "
      />
    </template>
    <template #name-after>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="secondary"
              size="icon-xs"
              class="text-destructive!"
              @click="() => {
                delete profilesStore.selectedProfile.filters[type];
              }"
            >
              <i class="i-lucide-x size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Delete this condition
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </template>
  </Fieldset>
</template>
