<script setup lang="ts">
const { name } = defineProps<{
  name: string;
}>();
</script>

<template>
  <fieldset
    v-auto-animate
    data-testid="fieldset"
    class="
      fieldset w-full rounded-box border border-base-300 bg-emphasis p-3
      text-base/tight
    "
  >
    <legend
      data-testid="fieldset-legend"
      class="fieldset-legend font-semibold"
    >
      <slot name="name-before" />
      <span data-testid="fieldset-name">{{ name }}</span>
      <slot name="name-after" />
    </legend>
    <div data-testid="fieldset-main">
      <slot name="main" />
    </div>
  </fieldset>
</template>
