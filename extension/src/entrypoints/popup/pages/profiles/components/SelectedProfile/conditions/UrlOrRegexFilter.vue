<script setup lang="tsx">
import type { UrlOrRegexFilterItem } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed, h, resolveComponent } from "vue";
import { useI18n } from "vue-i18n";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { useCurrentTabUrl } from "#/composables/useCurrentTabUrl";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addItemToGroup } from "@/lib/utils";

const list = defineModel<UrlOrRegexFilterItem[]>({
  required: true,
});

const { filterType } = defineProps<{
  filterType: "urlFilter" | "regexFilter";
}>();

const { t } = useI18n();
const I18nT = resolveComponent("i18n-t");

const urlFilterTokens = {
  wildcard: "*",
  anchor: "|",
  domainAnchor: "||",
  separator: "^",
  separatorExcludedChars: "_ - . %",
  regexEngine: "RE2",
} as const;

const field = computed(() => ({
  urlFilter: {
    title: t("condition.urlFilter.title"),
    description: (
      <>
        <p>
          <a
            href="https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#url_filter_syntax"
            target="_blank"
          >
            {t("condition.urlFilter.syntaxLink")}
          </a>
        </p>
        <ul>
          <li>
            <code>{urlFilterTokens.wildcard}</code>
            {t("condition.urlFilter.wildcard")}
          </li>
          <li>
            <code>{urlFilterTokens.anchor}</code>
            {t("condition.urlFilter.anchor")}
          </li>
          <li>
            <code>{urlFilterTokens.domainAnchor}</code>
            {t("condition.urlFilter.domainAnchor")}
          </li>
          <li>
            {h(I18nT, {
              keypath: "condition.urlFilter.separator",
              tag: "span",
            }, {
              chars: () => <code>{urlFilterTokens.separatorExcludedChars}</code>,
              separator: () => <code>{urlFilterTokens.separator}</code>,
            })}
          </li>
        </ul>
        <p>
          {t("condition.urlFilter.format")}
        </p>
        <p>{t("condition.urlFilter.omitted")}</p>
        <p>{t("condition.urlFilter.onlyOne")}</p>
      </>
    ),
  },
  regexFilter: {
    title: t("condition.regexFilter.title"),
    description: (
      <>
        <p>
          {t("condition.regexFilter.description")}
        </p>
        <p>
          {t("condition.regexFilter.syntaxPrefix")}
          {" "}
          <a href="https://github.com/google/re2/wiki/syntax" target="_blank">{urlFilterTokens.regexEngine}</a>
          {" "}
          {t("condition.regexFilter.syntaxSuffix")}
        </p>
      </>
    ),
  },
} as const));

const profilesStore = useProfilesStore();

function deleteGroup() {
  // Using `=undefined` will result in loss of responsiveness.
  delete profilesStore.selectedProfile.filters[filterType];
}

function newField() {
  const item = {
    id: uuidv7(),
    enabled: true,
    value: "",
  };
  addItemToGroup(list.value, item, "radio");
}

const { currentUrl, canUseCurrentUrl } = useCurrentTabUrl();
</script>

<template>
  <Group
    v-model:list="list"
    :name="field[filterType].title"
    type="radio"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="list"
        :description="field[filterType].description"
        @delete-group="deleteGroup"
        @new-field="newField"
      />
    </template>
    <template #item="{ index }">
      <div
        class="
          flex flex-1 flex-col items-end gap-1
          sm:flex-row sm:items-center
        "
      >
        <Input
          v-model.trim.lazy="list[index]!.value"
          placeholder="|https://example.com/"
          class="
            text-base
            placeholder:italic
          "
        />
        <div class="flex gap-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="secondary"
                  size="icon-xs"
                  :disabled="!canUseCurrentUrl"
                  @click="() => {
                    list[index]!.value = filterType === 'urlFilter'
                      // Metacharacters *+?()|
                      ? `|${currentUrl!.href}|` : currentUrl!.href.replaceAll(/[-\\^$*+?()|.\[\]{}:]/g, '\\$&');
                  }"
                >
                  <i class="i-lucide-at-sign size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {{ t("condition.urlFilter.useCurrentTabUrl") }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
            v-model:field="list[index]!"
            :index
          />
        </div>
      </div>
    </template>
  </Group>
</template>
