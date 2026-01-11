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
      fieldset rounded-box border-base-300 w-full border bg-primary-foreground
      p-3
    "
  >
    <legend
      data-testid="fieldset-legend"
      class="fieldset-legend text-base font-semibold"
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
