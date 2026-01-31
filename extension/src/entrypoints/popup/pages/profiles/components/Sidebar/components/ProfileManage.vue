<script setup lang="ts">
import type { HeaderMod } from "@/lib/type";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/ui/sheet";
import { useEventListener } from "@vueuse/core";
import { computed, ref } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";

const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();
const open = ref(false);
function handleSearchShortcut(event: KeyboardEvent) {
  if (!settingsStore.enableMetaKSearch) {
    return;
  }
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
    || profile.id.includes(searchKeyword.value)
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
    <SheetContent
      side="left" class="
        flex w-2/5 flex-col gap-4 text-base
        sm:max-w-xs
      "
    >
      <SheetHeader>
        <SheetTitle>Search profiles</SheetTitle>
      </SheetHeader>
      <div class="relative mx-4">
        <i
          class="
            absolute top-1/2 left-2.5 i-lucide-search size-4 -translate-y-1/2
            opacity-50
          "
        />
        <Input
          v-model.lazy.trim="searchKeyword"
          type="search"
          placeholder="Search profiles..."
          class="pl-8"
          autofocus
        />
      </div>
      <div
        v-auto-animate
        class="mx-3 flex flex-1 flex-col gap-1 overflow-y-auto px-1"
      >
        <div
          v-for="profile in searchResults"
          :key="profile.id"
          class="w-full"
        >
          <Button
            variant="ghost"
            class="w-full justify-start gap-2"
            @click="() => {
              profilesStore.manager.selectedProfileId = profile.id
              open = false
            }"
          >
            <span class="text-lg leading-none">{{ profile.emoji }} </span>
            <span class="truncate">{{ profile.name }}</span>
          </Button>
        </div>
        <div
          v-if="searchResults.length === 0"
          class="py-6 text-center text-sm text-muted-foreground"
        >
          No profiles found.
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
