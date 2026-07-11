<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { computed } from "vue";
import { Button } from "#/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { cn } from "@/lib/utils";
import ContextMenuWithTrigger from "../../ProfileActions/ContextMenuWithTrigger.vue";

const props = withDefaults(defineProps<{
  profile: Profile;
  index: number;
  layout?: "icon" | "row";
  switchable?: boolean;
}>(), {
  layout: "icon",
  switchable: true,
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
  (e: "select", profileId: string): void;
}>();

const profilesStore = useProfilesStore();

const isSelected = computed(() => profilesStore.manager.selectedProfileId === props.profile.id);
const hasError = computed(() => Boolean(profilesStore.profileId2ErrorMessageRecord[props.profile.id]));
const hasRegisteredRule = computed(() => Boolean(profilesStore.profileId2RelatedRuleIdRecord[props.profile.id]));

function handleClick(event: MouseEvent) {
  if (!props.switchable) {
    emit("click", event);
    return;
  }

  if (event.shiftKey) {
    profilesStore.toggleProfileEnabled(props.profile.id);
    return;
  }

  profilesStore.manager.selectedProfileId = props.profile.id;
  emit("select", props.profile.id);
}

function handleMiddleClick() {
  if (props.switchable) {
    profilesStore.toggleProfileEnabled(props.profile.id);
  }
}
</script>

<template>
  <ContextMenuWithTrigger :profile>
    <Button
      :size="layout === 'icon' ? 'icon-sm' : 'default'"
      :variant="layout === 'icon'
        ? (isSelected ? 'default' : 'secondary')
        : (isSelected ? 'secondary' : 'ghost')"
      :class="cn(
        'relative select-none',
        layout === 'icon' && 'flex text-xl',
        layout === 'row' && 'w-full justify-start gap-1 px-1.5!',
        isSelected && layout === 'icon' && 'bg-brand!',
      )"
      @click="handleClick"
      @mousedown.middle.prevent="handleMiddleClick"
    >
      <slot
        name="prefix"
        :selected="isSelected"
        :profile
        :index
      />

      <TooltipProvider v-if="layout === 'icon'" ignore-non-keyboard-focus>
        <Tooltip>
          <TooltipTrigger as-child>
            <div class="relative flex size-full items-center justify-center">
              <span :class="cn({ 'opacity-30': !profile.enabled })">
                {{ profile.emoji }}
              </span>
              <span
                v-if="hasError || hasRegisteredRule"
                :class="cn(
                  `
                    absolute top-0 right-0 z-10 inline-block aspect-square
                    size-2 translate-x-1/2 -translate-y-1/2 rounded-full
                    bg-[radial-gradient(circle_at_35%_30%,oklch(1_0_0/calc(var(--depth)*.5)),#0000)]
                    bg-center bg-no-repeat align-middle
                    shadow-[0_2px_3px_-1px_color-mix(in_oklab,currentColor_calc(var(--depth)*100%),#0000)]
                    [--depth:1]
                  `,
                  hasError && 'bg-error text-error',
                  hasRegisteredRule && 'bg-success text-success',
                )"
              />
              <i
                v-if="!profile.enabled"
                class="
                  absolute right-0 bottom-0 i-lucide-pause size-4 -translate-1/2
                "
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ profile.name }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <template v-else>
        <span
          class="
            relative flex size-6 shrink-0 items-center justify-center text-lg
            leading-none
          "
        >
          <span :class="cn({ 'opacity-30': !profile.enabled })">
            {{ profile.emoji }}
          </span>
          <span
            v-if="hasError || hasRegisteredRule"
            :class="cn(
              `
                absolute top-0 right-0 z-10 inline-block aspect-square size-2
                translate-x-1/2 -translate-y-1/2 rounded-full
                bg-[radial-gradient(circle_at_35%_30%,oklch(1_0_0/calc(var(--depth)*.5)),#0000)]
                bg-center bg-no-repeat align-middle
                shadow-[0_2px_3px_-1px_color-mix(in_oklab,currentColor_calc(var(--depth)*100%),#0000)]
                [--depth:1]
              `,
              hasError && 'bg-error text-error',
              hasRegisteredRule && 'bg-success text-success',
            )"
          />
          <i
            v-if="!profile.enabled"
            class="
              absolute right-0 bottom-0 i-lucide-pause size-3 -translate-1/2
            "
          />
        </span>
        <span class="truncate">{{ profile.name }}</span>
      </template>
    </Button>
  </ContextMenuWithTrigger>
</template>
