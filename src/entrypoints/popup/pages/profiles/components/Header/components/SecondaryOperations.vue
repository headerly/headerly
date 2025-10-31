<script setup lang="ts">
const popovertarget = `popover-profile-secondary-operations`;
</script>

<template>
  <div>
    <div
      :popovertarget
      :style="`anchor-name:--${popovertarget}`"
    >
      <slot name="trigger" :popovertarget />
    </div>
    <ul
      :id="popovertarget"
      :style="`position-anchor:--${popovertarget}`"
      popover
      class="
        menu dropdown z-1 w-52 rounded-box bg-base-300 p-2 font-medium shadow-sm
        [position-area:end_span-start]
        [position-try-fallbacks:flip-block]
      "
    >
      <li>
        <button>
          <i class="i-lucide-copy size-4" />
          <span>Copy ID</span>
        </button>
      </li>
      <li>
        <button>
          <i class="i-lucide-copy-plus size-4" />
          <span>Duplicate</span>
        </button>
      </li>
      <div class="divider my-0" />
      <li>
        <button>
          <i class="i-lucide-arrow-big-up size-4" />
          <span>Move Up</span>
        </button>
      </li>
      <li>
        <button>
          <i class="i-lucide-arrow-big-down size-4" />
          <span>Move Down</span>
        </button>
      </li>
    </ul>
  </div>
</template>
