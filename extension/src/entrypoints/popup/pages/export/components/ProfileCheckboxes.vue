<script setup lang="ts">
import type { Profile } from "@headerly/schema";
import { buildProfileBlocks } from "@headerly/schema";
import { Button } from "@headerly/ui/components/button";
import { Checkbox } from "@headerly/ui/components/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@headerly/ui/components/tooltip";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ProfileGroupFrame from "#/components/ProfileGroupFrame.vue";
import ProfileGroupDisplayName from "#/pages/profiles/components/ProfileGroupDisplayName.vue";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useScrollToProfile } from "@/composables/useScrollToProfile";
import ExportProfileOption from "./ExportProfileOption.vue";

const model = defineModel<Profile[]>({
  required: true,
});

const { scrollTargetIdOnMounted } = defineProps<{
  scrollTargetIdOnMounted?: string | undefined;
}>();

const profilesStore = useProfilesStore();
const blocks = computed(() => buildProfileBlocks(profilesStore.manager.profiles, profilesStore.profileGroups));

function groupChecked(profiles: Profile[]) {
  const count = profiles.filter(isSelected).length;
  if (count === 0)
    return false;
  return count === profiles.length ? true : "indeterminate";
}

function toggleGroup(profiles: Profile[]) {
  const ids = new Set(profiles.map(profile => profile.id));
  const selected = model.value.filter(profile => !ids.has(profile.id));
  model.value = groupChecked(profiles) === true ? selected : [...selected, ...profiles];
}
const { t } = useI18n();
const { setRef } = useScrollToProfile({
  scrollTargetIdOnMounted,
});

const allChecked = computed({
  get() {
    const total = profilesStore.manager.profiles.length;
    const selected = profilesStore.manager.profiles.filter(isSelected).length;
    if (selected === 0)
      return false;
    if (selected === total)
      return true;
    return "indeterminate";
  },
  set(value) {
    const newProfiles = value === true ? profilesStore.manager.profiles : [];
    model.value = newProfiles;
  },
});

function isSelected(profile: Profile) {
  return model.value.some(p => p.id === profile.id);
}

function toggleProfile(profile: Profile, checked: unknown) {
  let newProfiles: Profile[];
  if (checked === true) {
    newProfiles = isSelected(profile) ? model.value : [...model.value, profile];
  } else {
    newProfiles = model.value.filter(p => p.id !== profile.id);
  }
  model.value = newProfiles;
}

const selectAllLabel = computed(() =>
  allChecked.value === false || allChecked.value === "indeterminate"
    ? t("share.selectAll")
    : t("share.unselectAll"),
);
</script>

<template>
  <div
    class="
      flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-1.25
      [scrollbar-width:none]
    "
  >
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon-sm"
            as="div"
            variant="secondary"
            class="flex size-8 items-center justify-center p-2"
          >
            <Checkbox
              :model-value="allChecked"
              :aria-label="selectAllLabel"
              data-testid="export-select-all"
              class="border-2 border-accent-foreground"
              @update:model-value="allChecked = $event"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {{ selectAllLabel }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <div v-for="(block, index) in blocks" :key="block.id">
      <ProfileGroupFrame v-if="block.kind === 'group'" :group="block.group" :open="true">
        <template #header>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  :data-testid="`export-group-${block.id}`"
                  variant="secondary" size="icon-sm"
                  class="h-6! shrink-0 text-background"
                  :style="{ backgroundColor: block.group.color }"
                  :aria-label="t('share.selectGroup')"
                  :aria-pressed="groupChecked(block.profiles) === 'indeterminate' ? 'mixed' : groupChecked(block.profiles)"
                  @click="toggleGroup(block.profiles)"
                >
                  <Checkbox
                    as="span"
                    :model-value="groupChecked(block.profiles)"
                    tabindex="-1"
                    aria-hidden="true"
                    class="
                      pointer-events-none border-2 border-accent-foreground
                      bg-secondary/50 shadow-sm
                    "
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <ProfileGroupDisplayName :group="block.group" :profiles="block.profiles" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </template>
        <div class="flex flex-col gap-1">
          <div
            v-for="(profile, memberIndex) in block.profiles" :key="profile.id"
            :ref="(el) => setRef(el as HTMLDivElement | null, profile.id)"
          >
            <ExportProfileOption :profile :index="memberIndex" :checked="isSelected(profile)" @toggle="toggleProfile(profile, !isSelected(profile))" />
          </div>
        </div>
      </ProfileGroupFrame>
      <div v-else :ref="(el) => setRef(el as HTMLDivElement | null, block.profile.id)">
        <ExportProfileOption :profile="block.profile" :index :checked="isSelected(block.profile)" @toggle="toggleProfile(block.profile, !isSelected(block.profile))" />
      </div>
    </div>
  </div>
</template>
