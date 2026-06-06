<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { match } from "ts-pattern";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
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
const { t } = useI18n();
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
    const newProfiles = match(value === true)
      .with(true, () => profilesStore.manager.profiles)
      .with(false, () => [])
      .exhaustive();
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
    newProfiles = match(isSelected(profile))
      .with(true, () => model.value)
      .with(false, () => [...model.value, profile])
      .exhaustive();
  } else {
    newProfiles = model.value.filter(p => p.id !== profile.id);
  }
  model.value = newProfiles;
  emit("change", newProfiles);
}

const selectAllLabel = computed(() =>
  match(allChecked.value === false || allChecked.value === "indeterminate")
    .with(true, () => t("export.selectAll"))
    .with(false, () => t("export.unselectAll"))
    .exhaustive(),
);
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
          {{ selectAllLabel }}
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
