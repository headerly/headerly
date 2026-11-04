<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { Checkbox } from "@headerly/ui/components/checkbox";
import ProfileOption from "#/components/ProfileOption.vue";

defineProps<{ profile: Profile; index: number; checked: boolean }>();
const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <ProfileOption
    :profile :index
    :data-testid="`export-profile-${profile.id}`"
    :aria-label="profile.name"
    :aria-pressed="checked"
    @click="emit('toggle')"
  >
    <Checkbox
      as="span"
      :model-value="checked"
      tabindex="-1"
      aria-hidden="true"
      class="
        pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-1/2
        border-2 border-accent-foreground bg-secondary/50 shadow-sm
      "
    />
  </ProfileOption>
</template>
