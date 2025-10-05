<script setup lang="ts">
import { useProfilesStore } from "#/stores/useProfilesStore";
import { cn } from "@/lib/utils";
import Header from "./components/Header";
import SelectedProfile from "./components/SelectedProfile";
import Sidebar from "./components/Sidebar";

const profilesStore = useProfilesStore();
</script>

<template>
  <div
    :class="cn(
      `grid grid-cols-[3rem_minmax(0,1fr)] grid-rows-[3rem_minmax(0,1fr)]`,
      'size-full',
    )"
  >
    <Sidebar class="col-start-1 row-span-2" />
    <Header class="col-start-2 row-start-1" />
    <main
      class="col-start-2 row-start-2 overflow-x-hidden overflow-y-auto"
    >
      <!-- Use `key` to force refresh components to prevent `auto-animate`
         from applying animations across profiles -->
      <SelectedProfile :key="profilesStore.manager.selectedProfileId" />
    </main>
  </div>
</template>
