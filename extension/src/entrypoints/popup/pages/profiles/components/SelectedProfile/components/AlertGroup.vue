<script setup lang="ts">
import { useProfilesStore } from "#/stores/useProfilesStore";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#/ui/alert";
import { Button } from "#/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "#/ui/button-group";
import { useEventBus } from "@vueuse/core";
import { uuidv7 } from "uuidv7";

import { computed } from "vue";
import { openAddModModalKey } from "../../Header/components/AddModModal/open";

const { empty, hasAnyFilters } = defineProps<{
  empty: boolean;
  hasAnyFilters: boolean;
}>();
const profilesStore = useProfilesStore();

function ignoreWarning() {
  profilesStore.selectedProfile.filters.urlFilter = [
    { id: uuidv7(), enabled: true, value: "*", comments: "" },
  ];
}

const showGlobalRuleWarning = computed(() => {
  const hasRule = Boolean(profilesStore.profileId2RelatedRuleIdRecord[profilesStore.selectedProfile.id]);
  return !hasAnyFilters && !empty && hasRule;
});

const bus = useEventBus(openAddModModalKey);
</script>

<template>
  <Alert
    v-if="profilesStore.profileId2ErrorMessageRecord[profilesStore.selectedProfile.id]"
    variant="destructive"
  >
    <i class="i-lucide-bug size-6" />
    <AlertTitle>
      This profile caused an error when registering rules.
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
          Report issue
        </Button>
        <ButtonGroupSeparator />
        <Button
          size="sm"
          variant="secondary"
          as="a"
          target="_blank"
          href="https://headerly.dev/docs"
        >
          <i class="i-lucide-wrench size-4" />
          Troubleshoot
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
    <AlertTitle>This profile affects every request and might break sites.</AlertTitle>
    <AlertDescription>
      <p>Add a condition to avoid issues.</p>
      <ButtonGroup>
        <Button size="sm" variant="secondary" @click="ignoreWarning">
          <i class="i-lucide-ban size-4" />
          Ignore warning
        </Button>
        <ButtonGroupSeparator />
        <Button size="sm" variant="secondary" @click="bus.emit({ target: 'conditions' })">
          <i class="i-lucide-plus size-4" />
          Add a condition
        </Button>
      </ButtonGroup>
    </AlertDescription>
  </Alert>
</template>
