<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import ProfileOption from "#/components/ProfileOption.vue";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { Button } from "#/ui/button";
import { Checkbox } from "#/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { computed } from "vue";
import { useScrollToProfile } from "@/composables/useScrollToProfile";

const model = defineModel<Profile[]>({
  required: true,
});

const { scrollTargetIdOnMounted } = defineProps<{
  scrollTargetIdOnMounted?: string | undefined;
}>();

const emit = defineEmits<{
  (e: "change", profiles: Profile[]): void;
}>();

const profilesStore = useProfilesStore();
const { setRef } = useScrollToProfile({
  scrollTargetIdOnMounted,
});

const allChecked = computed({
  get() {
    const total = profilesStore.manager.profiles.length;
    const selected = model.value.length;
    if (selected === 0)
      return false;
    if (selected === total)
      return true;
    return "indeterminate";
  },
  set(value) {
    const newProfiles = value === true ? profilesStore.manager.profiles : [];
    model.value = newProfiles;
    emit("change", newProfiles);
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
  emit("change", newProfiles);
}
</script>

<template>
  <div
    class="
      flex flex-1 flex-col gap-1 overflow-y-auto px-2 [scrollbar-width:none]
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
              class="border-2 border-accent-foreground"
              @update:model-value="allChecked = $event"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {{ allChecked === false || allChecked === "indeterminate" ? 'Select all' : 'Unselect all' }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <div
      v-for="(profile, index) in profilesStore.manager.profiles"
      :key="profile.id"
      :ref="(el) => setRef(el as HTMLDivElement | null, profile.id)"
      class="relative cursor-pointer"
      @click="toggleProfile(profile, !isSelected(profile))"
    >
      <ProfileOption
        :index
        :profile
        as="div"
      />
      <Checkbox
        :model-value="isSelected(profile)"
        class="
          pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-1/2
          border-2 border-accent-foreground bg-secondary/50 shadow-sm
        "
      />
    </div>
  </div>
</template>
