<script setup lang="ts">
const { name } = defineProps<{
  name: string;
}>();
</script>

<template>
  <fieldset
    v-auto-animate
    class="fieldset w-full rounded-box border border-base-300 bg-base-200 p-3"
  >
    <legend class="fieldset-legend text-base font-medium">
      <slot name="name-before" />
      {{ name }}
      <slot name="name-after" />
    </legend>
    <slot name="main" />
  </fieldset>
</template>
