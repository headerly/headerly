<script setup lang="ts">
import type { HeaderMod } from "@/lib/type";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useEventListener } from "@vueuse/core";

import { computed, ref } from "vue";
import { cn } from "@/lib/utils";

const profilesStore = useProfilesStore();

const open = ref(false);
function handleSearchShortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    open.value = !open.value;
  }
}

useEventListener(window, "keydown", handleSearchShortcut);

const searchKeyword = ref("");

function matchHeaderMod(mod: HeaderMod) {
  return mod.name?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    || (mod.operation !== "remove" && mod.value.toLowerCase().includes(searchKeyword.value.toLowerCase()));
}

const searchResults = computed(() => {
  if (!searchKeyword.value) {
    return profilesStore.manager.profiles;
  }
  return profilesStore.manager.profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    || profile.emoji.includes(searchKeyword.value)
    || profile.requestHeaderModGroups.some(({ items: mods }) => mods.some(matchHeaderMod))
    || profile.responseHeaderModGroups.some(({ items: mods }) => mods.some(matchHeaderMod)),
  );
});
</script>

<template>
  <Sheet v-model:open="open">
    <SheetTrigger as-child>
      <slot />
    </SheetTrigger>
    <SheetContent side="left" class="w-2/5 text-base">
      <SheetHeader>
        <SheetTitle>Search Profiles</SheetTitle>
        <SheetDescription class="sr-only">
          Search your profiles
        </SheetDescription>
      </SheetHeader>
      <div v-auto-animate class="grid w-full gap-1 overflow-y-auto px-2 py-1">
        <label class="input mb-2 w-full">
          <i class="i-lucide-search size-4 opacity-50" />
          <input v-model="searchKeyword" type="search" class="w-full" placeholder="Search" autofocus>
        </label>
        <div
          v-for="profile in searchResults"
          :key="profile.id"
          class="w-full"
        >
          <button
            :class="cn(
              `
                btn grid w-full grid-cols-[1rem_1fr] place-content-center
                items-center justify-start gap-2 btn-ghost
                hover:btn-primary
              `,
            )"
            @click="profilesStore.manager.selectedProfileId = profile.id"
          >
            <span>{{ profile.emoji }} </span>
            <span
              class="
                overflow-hidden text-start overflow-ellipsis whitespace-nowrap
              "
            >{{ profile.name }}</span>
          </button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
