<script setup lang="ts">
const { name } = defineProps<{
  name: string;
}>();
</script>

<template>
  <fieldset
    v-auto-animate
    class="
      grid w-full grid-flow-row auto-rows-max grid-cols-1 gap-6 rounded border
      p-3 pt-2 pb-4
    "
  >
    <legend
      class="
        -mb-1 flex items-center justify-between gap-2 py-2 text-base
        font-semibold
      "
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
