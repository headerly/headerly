<script setup lang="ts">
const { name } = defineProps<{
  name: string;
}>();
</script>

<template>
  <fieldset
    v-auto-animate
    class="
      grid w-full grid-flow-row auto-rows-max grid-cols-1 gap-6 rounded-sm
      border p-3 pt-2 pb-4
    "
  >
    <legend
      class="
        sticky top-0 z-10 -mb-1 flex w-full items-center justify-between gap-2
        bg-background py-2 text-base font-medium
      "
    >
      <slot name="name-before" />
      <span data-testid="fieldset-name">{{ name }}</span>
      <div class="flex flex-1 items-center gap-1">
        <slot name="group-actions">
          <span class="h-0 flex-1 border-t" />
        </slot>
      </div>
    </legend>
    <div data-testid="fieldset-main">
      <slot name="main" />
    </div>
  </fieldset>
</template>
