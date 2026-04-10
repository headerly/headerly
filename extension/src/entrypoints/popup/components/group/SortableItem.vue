<template>
  <div
    data-sortable-item
    class="group relative flex flex-1 items-center justify-between gap-1"
  >
    <i
      data-sort-handle
      class="
        absolute top-1/2 -left-5 z-10 i-lucide-grip-vertical size-4
        -translate-y-1/2 cursor-grab items-center justify-center rounded-sm
        border text-muted-foreground opacity-0 shadow-sm transition-opacity
        group-hover:opacity-100
        active:cursor-grabbing
        [[data-sorting]_.sortable-ghost_&]:opacity-100
        [[data-sorting]_[data-sortable-item]:hover_&]:opacity-0
      "
    />
    <slot />
  </div>
</template>
