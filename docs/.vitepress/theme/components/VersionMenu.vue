<script setup lang="ts">
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@headerly/ui/components/dropdown-menu";

defineProps<{
  version: string;
  items: { text: string; link: string }[];
  screenMenu?: boolean;
}>();
</script>

<template>
  <div class="flex h-full items-center" :class="screenMenu ? 'py-3' : 'px-3'">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          :aria-label="`Version ${version} resources`"
          class="
            flex items-center gap-0.5 rounded-2xl bg-gray-950/5 py-0.5 pr-1.5
            pl-2.5 text-xs/5 font-medium text-gray-950 tabular-nums
            hover:bg-gray-950/7.5
            focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-ring
            data-[state=open]:bg-gray-950/7.5
            dark:bg-white/10 dark:text-white
            dark:hover:bg-white/12.5
            dark:data-[state=open]:bg-white/12.5
          "
        >
          v{{ version }}
          <i class="i-lucide-chevron-down size-4 text-gray-400" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent :align="screenMenu ? 'start' : 'end'">
        <DropdownMenuItem
          v-for="item in items" :key="item.link" as-child class=""
        >
          <a
            :href="item.link" target="_blank" rel="noopener noreferrer"
          >
            {{ item.text }}
            <i class="ml-auto i-lucide-arrow-up-right size-4" aria-hidden="true" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
