<script setup lang="ts">
import { features, statuses, tools } from "./comparison";
</script>

<template>
  <div class="comparison-matrix">
    <div class="comparison-legend" aria-label="Comparison legend">
      <span v-for="(status, key) in statuses" :key :data-support="key" :title="status.description">
        <i :class="status.icon" aria-hidden="true" /> {{ status.label }}
      </span>
    </div>
    <div class="comparison-table-scroll" role="region" aria-label="Feature comparison; scroll horizontally to see all tools" tabindex="0">
      <table class="comparison-table">
        <caption class="sr-only">
          Feature availability in Headerly, Requestly, ModHeader, Header Editor, and tweak
        </caption>
        <thead>
          <tr>
            <th scope="col">
              Feature
            </th>
            <th v-for="(tool, index) in tools" :key="tool.name" scope="col" :class="{ 'comparison-headerly': index === 0 }">
              <a :href="tool.source">{{ tool.name }}</a>
              <span v-if="index === 0" class="comparison-product-label">THIS TOOL</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="feature in features" :key="feature.name">
            <th scope="row">
              {{ feature.name }}
              <span v-if="feature.detail" class="comparison-feature-detail">{{ feature.detail }}</span>
            </th>
            <td v-for="(cell, index) in feature.support" :key="tools[index]!.name" :class="{ 'comparison-headerly': index === 0 }">
              <span class="comparison-support" :data-support="cell.status" :title="statuses[cell.status].description">
                <i :class="statuses[cell.status].icon" aria-hidden="true" />
                {{ statuses[cell.status].label }}
              </span>
              <span v-if="cell.note" class="comparison-cell-note">{{ cell.note }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="comparison-table-note">
      “Unverified” means the reviewed documentation does not confirm this exact feature; it does not mean “No”.
      “Yes” describes availability, not a guarantee of free access in every plan.
      Checked September 13, 2026. <a href="/explanation/compare-tools#matrix-sources">Sources and qualifications</a>.
    </p>
  </div>
</template>
