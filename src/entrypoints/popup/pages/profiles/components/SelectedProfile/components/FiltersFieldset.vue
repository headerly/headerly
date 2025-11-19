<script setup lang="tsx">
import { useProfilesStore } from "#/stores/useProfilesStore";
import { computed } from "vue";
import DomainsFilter from "../conditions/DomainsFilter.vue";
import DomainType from "../conditions/DomainType.vue";
import UrlOrRegexFilter from "../conditions/UrlOrRegexFilter.vue";

const profilesStore = useProfilesStore();

const filters = computed(() => profilesStore.selectedProfile.filters);
</script>

<template>
  <UrlOrRegexFilter
    v-if="filters.urlFilter?.length"
    v-model="filters.urlFilter"
    filter-type="urlFilter"
  />
  <UrlOrRegexFilter
    v-if="filters.regexFilter?.length"
    v-model="filters.regexFilter"
    filter-type="regexFilter"
  />
  <DomainsFilter
    v-if="filters.requestDomains?.items.length"
    v-model="filters.requestDomains"
    filter-type="requestDomains"
  />
  <DomainsFilter
    v-if="filters.excludedRequestDomains?.items.length"
    v-model="filters.excludedRequestDomains"
    filter-type="excludedRequestDomains"
  />
  <DomainsFilter
    v-if="filters.initiatorDomains?.items.length"
    v-model="filters.initiatorDomains"
    filter-type="initiatorDomains"
  />
  <DomainsFilter
    v-if="filters.excludedInitiatorDomains?.items.length"
    v-model="filters.excludedInitiatorDomains"
    filter-type="excludedInitiatorDomains"
  />
  <DomainType
    v-if="filters.domainType"
    v-model="filters.domainType"
  />
</template>
