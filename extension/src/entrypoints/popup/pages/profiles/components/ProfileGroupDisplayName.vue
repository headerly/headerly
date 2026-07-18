<script setup lang="ts">
import type { Profile, ProfileGroup } from "@/lib/schema";
import { computed, resolveComponent } from "vue";

const props = defineProps<{
  group: ProfileGroup;
  profiles: Profile[];
}>();

const I18nT = resolveComponent("i18n-t");
const firstProfileName = computed(() => props.profiles[0]?.name ?? "");
const remainingProfileCount = computed(() => Math.max(0, props.profiles.length - 1));
</script>

<template>
  <span v-if="group.name" class="min-w-0 truncate">{{ group.name }}</span>
  <I18nT
    v-else
    keypath="profile.actions.unnamedGroupLabel"
    tag="span"
    class="min-w-0"
    :plural="remainingProfileCount"
  >
    <template #profileName>
      <span class="inline-block max-w-[150px] truncate align-bottom">
        {{ firstProfileName }}
      </span>
    </template>
    <template #remainingCount>
      {{ remainingProfileCount }}
    </template>
  </I18nT>
</template>
