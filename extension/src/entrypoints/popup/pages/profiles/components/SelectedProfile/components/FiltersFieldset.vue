<script setup lang="tsx">
import { computed } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import DomainsFilter from "../conditions/DomainsFilter.vue";
import DomainType from "../conditions/DomainType.vue";
import IsUrlFilterCaseSensitive from "../conditions/IsUrlFilterCaseSensitive.vue";
import ResourceTypeOrRequestMethod from "../conditions/ResourceTypeOrRequestMethod.vue";
import UrlOrRegexFilter from "../conditions/UrlOrRegexFilter.vue";

const profilesStore = useProfilesStore();

const filters = computed(() => profilesStore.selectedProfile.filters);
</script>

<template>
  <IsUrlFilterCaseSensitive
    v-if="filters.isUrlFilterCaseSensitive"
    v-model="filters.isUrlFilterCaseSensitive"
  />
  <UrlOrRegexFilter
    v-if="filters.urlFilter"
    v-model="filters.urlFilter"
    filter-type="urlFilter"
  />
  <UrlOrRegexFilter
    v-if="filters.regexFilter"
    v-model="filters.regexFilter"
    filter-type="regexFilter"
  />
  <DomainsFilter
    v-if="filters.requestDomains"
    v-model="filters.requestDomains"
    filter-type="requestDomains"
  />
  <DomainsFilter
    v-if="filters.excludedRequestDomains"
    v-model="filters.excludedRequestDomains"
    filter-type="excludedRequestDomains"
  />
  <DomainsFilter
    v-if="filters.initiatorDomains"
    v-model="filters.initiatorDomains"
    filter-type="initiatorDomains"
  />
  <DomainsFilter
    v-if="filters.excludedInitiatorDomains"
    v-model="filters.excludedInitiatorDomains"
    filter-type="excludedInitiatorDomains"
  />
  <DomainType
    v-if="filters.domainType"
    v-model="filters.domainType"
  />
  <ResourceTypeOrRequestMethod
    v-if="filters.resourceTypes"
    v-model="filters.resourceTypes"
    type="resourceTypes"
  />
  <ResourceTypeOrRequestMethod
    v-if="filters.excludedResourceTypes"
    v-model="filters.excludedResourceTypes"
    type="excludedResourceTypes"
  />
  <ResourceTypeOrRequestMethod
    v-if="filters.requestMethods"
    v-model="filters.requestMethods"
    type="requestMethods"
  />
  <ResourceTypeOrRequestMethod
    v-if="filters.excludedRequestMethods"
    v-model="filters.excludedRequestMethods"
    type="excludedRequestMethods"
  />
</template>
