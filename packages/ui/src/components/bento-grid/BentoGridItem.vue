<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import { cn } from "@headerly/ui/lib/utils";

interface Props {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <div
    :class="
      cn(
        `
          group/bento row-span-1 flex flex-col justify-between space-y-4
          rounded-2xl border border-border bg-card p-6 transition duration-200
          hover:shadow-lg
          motion-reduce:transition-none
        `,
        props.class,
      )
    "
  >
    <slot name="header" />
    <div
      class="
        transition duration-200
        motion-safe:group-hover/bento:translate-x-1
      "
    >
      <slot name="icon" />
      <div class="my-2 font-sans font-bold text-card-foreground">
        <slot name="title" />
      </div>
      <div class="font-sans text-sm font-normal text-muted-foreground">
        <slot name="description" />
      </div>
    </div>
  </div>
</template>
