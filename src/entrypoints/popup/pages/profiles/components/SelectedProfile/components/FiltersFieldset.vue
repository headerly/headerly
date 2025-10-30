<script setup lang="tsx">
import { useProfilesStore } from "#/stores/useProfilesStore";
import { computed } from "vue";
import UrlFilter from "../filters/UrlFilter.vue";

const profilesStore = useProfilesStore();

const filters = computed(() => profilesStore.selectedProfile.filters);
</script>

<template>
  <div>
    <UrlFilter v-if="filters.urlFilter" v-model:list="filters.urlFilter" />
  </div>
</template>
