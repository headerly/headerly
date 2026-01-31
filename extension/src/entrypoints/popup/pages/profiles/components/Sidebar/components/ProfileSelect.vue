<script setup lang="tsx">
import type { UUID } from "node:crypto";
import CommentsDialog from "#/components/dialog/CommentsDialog.vue";
import { Button } from "#/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "#/ui/context-menu";
import { Kbd } from "#/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useEventListener } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { copyProfile, copyProfileId } from "@/entrypoints/popup/pages/profiles/components/Header/components/copyProfile";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { cn, getModKey } from "@/lib/utils";

const profilesStore = useProfilesStore();

// Vue cannot guarantee the order of refs,
// and must use id map management to ensure access to the correct element.
const profileRefs = ref<Map<UUID, HTMLDivElement>>(new Map());
const commentsDialogRefs = ref<Map<UUID, any>>(new Map());

onMounted(() => scrollToEnabledProfile("instant"));

watch(
  () => profilesStore.manager.selectedProfileId,
  () => scrollToEnabledProfile("smooth"),
  // Wait for DOM to be updated, otherwise the latest DOM element cannot be accessed.
  { flush: "post" },
);

function scrollToEnabledProfile(behavior: ScrollBehavior) {
  const target = profileRefs.value.get(profilesStore.manager.selectedProfileId);
  if (target) {
    target.scrollIntoView({
      behavior,
      block: "end",
    });
  }
}

const settingsStore = useSettingsStore();
function handleSwitchProfileShortcut(event: KeyboardEvent) {
  if (!settingsStore.enableMetaNumberShortcut) {
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key >= "1" && event.key <= "9") {
    event.preventDefault();
    const index = Number(event.key) - 1;
    const profiles = profilesStore.manager.profiles;
    if (index < profiles.length) {
      const profile = profiles[index]!;
      profilesStore.manager.selectedProfileId = profile.id;
    }
  }
}

useEventListener(window, "keydown", handleSwitchProfileShortcut);

function renderShortcutHint(index: number) {
  if (!settingsStore.enableMetaNumberShortcut || index >= 9) {
    return null;
  }
  return (
    <span>
      <Kbd class="mr-1">{getModKey()}</Kbd>
      <Kbd>{String(index + 1)}</Kbd>
    </span>
  );
}
</script>

<template>
  <TooltipProvider ignore-non-keyboard-focus>
    <div
      v-auto-animate
      class="
        flex flex-col gap-1 overflow-y-auto px-2 py-1.25
        [scrollbar-width:none]
      "
    >
      <div
        v-for="(profile, index) in profilesStore.manager.profiles"
        :key="profile.id"
        :ref="(el) => {
          if (el === null) {
            profileRefs.delete(profile.id);
          } else {
            profileRefs.set(profile.id, el as HTMLDivElement);
          }
        }"
      >
        <ContextMenu>
          <ContextMenuTrigger as-child>
            <Button
              size="icon-sm"
              :variant="profilesStore.manager.selectedProfileId === profile.id ? 'default' : 'secondary'"
              class="relative flex text-xl"
              @click="profilesStore.manager.selectedProfileId = profile.id"
            >
              <TooltipProvider ignore-non-keyboard-focus>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <span
                      :class="cn({ 'opacity-30': !profile.enabled })"
                    >
                      {{ profile.emoji }}
                    </span>
                    <span
                      v-if="profilesStore.profileId2ErrorMessageRecord[profile.id] || profilesStore.profileId2RelatedRuleIdRecord[profile.id]"
                      :class="cn(
                        `
                          absolute top-0 right-0 z-10 inline-block aspect-square
                          size-2 translate-x-1/2 -translate-y-1/2 rounded-full
                          bg-[radial-gradient(circle_at_35%_30%,oklch(1_0_0/calc(var(--depth)*.5)),#0000)]
                          bg-center bg-no-repeat align-middle
                          shadow-[0_2px_3px_-1px_color-mix(in_oklab,currentColor_calc(var(--depth)*100%),#0000)]
                          [--depth:1]
                        `,
                        profilesStore.profileId2ErrorMessageRecord[profile.id] && `
                          bg-error text-error
                        `,
                        profilesStore.profileId2RelatedRuleIdRecord[profile.id] && `
                          bg-success text-success
                        `,
                      )"
                    />
                    <i
                      v-if="!profile.enabled"
                      class="
                        absolute right-0 bottom-0 i-lucide-pause size-4
                        -translate-1/2
                      "
                    />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{{ profile.name }} <component :is="renderShortcutHint(index)" /></p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
          </ContextMenuTrigger>

          <ContextMenuContent
            :collision-padding="32"
            class="min-w-40"
          >
            <ContextMenuGroup>
              <ContextMenuLabel class="max-w-36 truncate">
                {{ profile.name }}
              </ContextMenuLabel>

              <ContextMenuItem @click="profilesStore.toggleProfileEnabled(profile.id)">
                {{ profile.enabled ? 'Pause' : 'Resume' }}
              </ContextMenuItem>
              <ContextMenuItem @click="profilesStore.duplicateProfile(profile.id)">
                Duplicate
              </ContextMenuItem>
              <ContextMenuItem class="text-destructive!" @click="profilesStore.deleteProfile(profile.id)">
                {{ profilesStore.manager.profiles.length === 1 ? 'Reset' : 'Delete' }}
              </ContextMenuItem>
              <ContextMenuItem @click="commentsDialogRefs.get(profile.id)?.open()">
                {{ profile.comments.length > 0 ? "Edit comments" : "Add comments" }}
              </ContextMenuItem>
              <ContextMenuItem @click="() => copyProfile(profile)">
                Copy to JSON
              </ContextMenuItem>
              <ContextMenuItem @click="() => copyProfileId(profile)">
                Copy ID
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem
                :disabled="!profilesStore.canMoveProfileUp(profile.id)"
                @click="profilesStore.moveProfileUp(profile.id)"
              >
                Move Up
              </ContextMenuItem>
              <ContextMenuItem
                :disabled="!profilesStore.canMoveProfileDown(profile.id)"
                @click="profilesStore.moveProfileDown(profile.id)"
              >
                Move Down
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
          <CommentsDialog
            :ref="(el) => {
              if (el === null) {
                commentsDialogRefs.delete(profile.id);
              } else {
                commentsDialogRefs.set(profile.id, el);
              }
            }"
            v-model="profilesStore.manager.profiles[index]!.comments"
          />
        </ContextMenu>
      </div>
    </div>
  </TooltipProvider>
</template>
