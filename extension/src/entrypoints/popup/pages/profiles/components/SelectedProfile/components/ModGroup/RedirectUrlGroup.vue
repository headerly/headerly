<script setup lang="ts">
import type { RedirectUrlGroupItem } from "@/lib/schema";
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
import { addItemToGroup, createRedirectUrl } from "@/lib/utils";

const list = defineModel<RedirectUrlGroupItem[]>({
  required: true,
});

const profilesStore = useProfilesStore();
const { currentUrl, canUseCurrentUrl } = useCurrentTabUrl();
const { t } = useI18n();

function addNewField() {
  addItemToGroup(list.value, createRedirectUrl(), "radio");
}

function deleteGroup() {
  delete profilesStore.selectedProfile.redirectUrlGroup;
}
</script>

<template>
  <Group
    :id="`${profilesStore.selectedProfile.id}:redirectUrlGroup`"
    v-model:list="list"
    type="radio"
    :name="t('redirectUrl.title')"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="list"
        :description="t('redirectUrl.description')"
        @delete-group="deleteGroup"
        @new-field="addNewField"
      />
    </template>
    <template #item="{ index }">
      <div
        class="
          flex flex-1 flex-col items-end justify-between gap-1
          sm:flex-row sm:items-center
        "
      >
        <div class="flex w-full flex-1">
          <Input
            v-model.trim.lazy="list[index]!.value"
            type="url"
            placeholder="https://example.com/"
            class="
              text-base
              placeholder:italic
            "
          />
        </div>
        <div class="flex items-center gap-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="secondary"
                  size="icon-xs"
                  :disabled="!canUseCurrentUrl"
                  @click="() => {
                    list[index]!.value = currentUrl!.href;
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
            size="icon-xs"
            variant="secondary"
            @click="() => {
              list.splice(index, 1);
            }"
          >
            <span class="sr-only">{{ t("redirectUrl.delete") }}</span>
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
