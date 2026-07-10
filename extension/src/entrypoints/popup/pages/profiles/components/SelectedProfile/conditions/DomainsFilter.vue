<script setup lang="tsx">
import type { DomainsFilter } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed } from "vue";
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

const domainsFilter = defineModel<DomainsFilter>({
  required: true,
});

const { filterType } = defineProps<{
  filterType: "requestDomains" | "excludedRequestDomains" | "initiatorDomains" | "excludedInitiatorDomains";
}>();

const { t } = useI18n();

const field = computed(() => ({
  requestDomains: {
    title: t("condition.domains.requestDomains.title"),
    description: (
      <>
        <p>
          {t("condition.domains.requestDomains.description")}
        </p>
        <ul>
          <li>{t("condition.domains.subdomainsAllowed")}</li>
          <li>{t("condition.domains.asciiOnly")}</li>
          <li>{t("condition.domains.punycode")}</li>
        </ul>
      </>
    ),
  },
  excludedRequestDomains: {
    title: t("condition.domains.excludedRequestDomains.title"),
    description: (
      <>
        <p>
          {t("condition.domains.excludedRequestDomains.description")}
        </p>
        <ul>
          <li>{t("condition.domains.subdomainsAllowed")}</li>
          <li>{t("condition.domains.asciiOnly")}</li>
          <li>{t("condition.domains.punycode")}</li>
        </ul>
      </>
    ),
  },
  initiatorDomains: {
    title: t("condition.domains.initiatorDomains.title"),
    description: (
      <>
        <p>
          {t("condition.domains.initiatorDomains.description")}
        </p>
        <ul>
          <li>{t("condition.domains.subdomainsAllowed")}</li>
          <li>{t("condition.domains.asciiOnly")}</li>
          <li>{t("condition.domains.punycode")}</li>
          <li>{t("condition.domains.matchesInitiator")}</li>
        </ul>
      </>
    ),
  },
  excludedInitiatorDomains: {
    title: t("condition.domains.excludedInitiatorDomains.title"),
    description: (
      <>
        <p>
          {t("condition.domains.excludedInitiatorDomains.description")}
        </p>
        <ul>
          <li>{t("condition.domains.subdomainsAllowed")}</li>
          <li>{t("condition.domains.asciiOnly")}</li>
          <li>{t("condition.domains.punycode")}</li>
          <li>{t("condition.domains.matchesInitiator")}</li>
        </ul>
      </>
    ),
  },
}));

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
  addItemToGroup(domainsFilter.value.items, item, domainsFilter.value.type);
}

function getDomainFromUserInput(value: string) {
  const userInput = value.trim();
  if (userInput === "") {
    return "";
  }

  for (const urlLikeValue of [userInput, `https://${userInput}`]) {
    try {
      const url = new URL(urlLikeValue);
      if (url.hostname) {
        return url.hostname;
      }
    } catch {}
  }

  return userInput;
}

const { currentUrl, canUseCurrentUrl } = useCurrentTabUrl();
</script>

<template>
  <Group
    :id="`${profilesStore.selectedProfile.id}:${filterType}`"
    v-model:list="domainsFilter.items"
    :name="field[filterType].title"
    :type="domainsFilter.type"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="domainsFilter.items"
        v-model:type="domainsFilter.type"
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
          :model-value="domainsFilter.items[index]!.value"
          :model-modifiers="{ lazy: true }"
          placeholder="example.com"
          class="
            w-full text-base
            placeholder:italic
          "
          @update:model-value="(value) => {
            domainsFilter.items[index]!.value = getDomainFromUserInput(value);
          }"
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
                    domainsFilter.items[index]!.value = currentUrl!.hostname;
                  }"
                >
                  <i class="i-lucide-at-sign size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {{ t("condition.domains.useCurrentTabDomain") }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="secondary"
            size="icon-xs"
            @click="() => {
              domainsFilter.items.splice(index, 1);
            }"
          >
            <span class="sr-only">{{ t("common.deleteDomain") }}</span>
            <i class="i-lucide-x size-4" />
          </Button>
          <ActionsDropdown
            v-model:list="domainsFilter.items"
            v-model:field="domainsFilter.items[index]!"
            :index
          />
        </div>
      </div>
    </template>
  </Group>
</template>
