<script lang="ts" setup>
import { cn } from "@/lib/utils";
import Header from "./components/Header.vue";
import Profile from "./components/Profile.vue";
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <div class="flex items-center justify-center">
    <div
      :class="cn(
        `
          grid grid-cols-[min-content_minmax(0,1fr)]
          grid-rows-[min-content_minmax(0,1fr)]
        `,
        'h-120 w-150 rounded-sm outline-2 outline-offset-2',
      )"
    >
      <Sidebar class="col-start-1 row-span-2" />
      <Header class="col-start-2 row-start-1" />
      <main class="col-start-2 row-start-2 overflow-y-auto p-2">
        <Profile />
      </main>
    </div>
  </div>
</template>
