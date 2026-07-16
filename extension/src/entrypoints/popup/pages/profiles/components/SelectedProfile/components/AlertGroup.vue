<script setup lang="ts">
import { useEventBus } from "@vueuse/core";
import { uuidv7 } from "uuidv7";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { sendMessage } from "##/background/message";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#/ui/alert";
import { Button } from "#/ui/button";

import { ButtonGroup, ButtonGroupSeparator } from "#/ui/button-group";
import { hasRegisterableAction } from "@/lib/profileRule";
import { openAddRuleOptionDialogKey } from "../../Header/components/AddRuleOptionDialog/open";

const { empty, hasAnyFilters } = defineProps<{
  empty: boolean;
  hasAnyFilters: boolean;
}>();
const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();

function ignoreWarning() {
  profilesStore.selectedProfile.filters.urlFilter = [
    { id: uuidv7(), enabled: true, value: "*" },
  ];
}

const showGlobalRuleWarning = computed(() => {
  const hasRegisteredRule = Boolean(profilesStore.profileId2RelatedRuleIdRecord[profilesStore.selectedProfile.id]);
  return !hasAnyFilters && !empty && hasRegisteredRule;
});

const showMissingSessionRuleWarning = computed(() => {
  const profile = profilesStore.selectedProfile;
  return profile.ruleScope === "session"
    && profile.enabled
    && settingsStore.powerOn
    && hasRegisterableAction(profile)
    && !profilesStore.profileId2RelatedRuleIdRecord[profile.id]
    && !profilesStore.profileId2ErrorMessageRecord[profile.id];
});

const bus = useEventBus(openAddRuleOptionDialogKey);
</script>

<template>
  <Alert
    v-if="profilesStore.profileId2ErrorMessageRecord[profilesStore.selectedProfile.id]"
    variant="destructive"
  >
    <i class="i-lucide-bug size-6" />
    <AlertTitle>
      {{ t("profile.alert.registrationErrorTitle") }}
    </AlertTitle>
    <AlertDescription>
      <p>{{ profilesStore.profileId2ErrorMessageRecord[profilesStore.selectedProfile.id] }}</p>
      <ButtonGroup>
        <Button
          size="sm"
          variant="secondary"
          as="a"
          target="_blank"
          href="https://github.com/headerly/headerly/issues"
        >
          <i class="i-lucide-github size-4" />
          {{ t("common.reportIssue") }}
        </Button>
      </ButtonGroup>
    </AlertDescription>
  </Alert>
  <Alert
    v-if="showMissingSessionRuleWarning"
    variant="warning"
    class="mt-2"
  >
    <i class="i-lucide-timer-reset size-6" />
    <AlertTitle>{{ t("profile.alert.sessionRuleMissingTitle") }}</AlertTitle>
    <AlertDescription>
      <p>{{ t("profile.alert.sessionRuleMissingDescription") }}</p>
      <ButtonGroup>
        <Button
          size="sm"
          variant="secondary"
          @click="sendMessage('reinitializeProfileRule', profilesStore.selectedProfile.id)"
        >
          <i class="i-lucide-refresh-cw size-4" />
          {{ t("profile.alert.reinitializeSessionRule") }}
        </Button>
      </ButtonGroup>
    </AlertDescription>
  </Alert>
  <Alert
    v-if="showGlobalRuleWarning"
    variant="warning"
    class="mt-2"
  >
    <i class="i-lucide-triangle-alert size-6" />
    <AlertTitle>{{ t("profile.alert.globalRuleTitle") }}</AlertTitle>
    <AlertDescription>
      <p>{{ t("profile.alert.globalRuleDescription") }}</p>
      <ButtonGroup>
        <Button size="sm" variant="secondary" @click="ignoreWarning">
          <i class="i-lucide-ban size-4" />
          {{ t("profile.alert.ignoreWarning") }}
        </Button>
        <ButtonGroupSeparator />
        <Button size="sm" variant="secondary" @click="bus.emit({ target: 'conditions' })">
          <i class="i-lucide-plus size-4" />
          {{ t("common.addCondition") }}
        </Button>
      </ButtonGroup>
    </AlertDescription>
  </Alert>
</template>
