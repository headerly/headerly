<script setup lang="ts">
import type {
  ProfileActionGroup,
  ProfileActionItem,
} from "./actions";
import type { Profile } from "@/lib/schema";
import { computed } from "vue";
import ProfileGroupDisplayName from "#/pages/profiles/components/ProfileGroupDisplayName.vue";
import {
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "#/ui/context-menu";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "#/ui/dropdown-menu";

const props = defineProps<{
  actionGroups: readonly ProfileActionGroup[];
  menuType: "context" | "dropdown";
  profile: Profile;
}>();

const emit = defineEmits<{
  openChangeRuleActionType: [];
  openComments: [];
  openPriority: [];
}>();

const menuComponentsByType = {
  context: {
    group: ContextMenuGroup,
    item: ContextMenuItem,
    separator: ContextMenuSeparator,
    sub: ContextMenuSub,
    subContent: ContextMenuSubContent,
    subTrigger: ContextMenuSubTrigger,
  },
  dropdown: {
    group: DropdownMenuGroup,
    item: DropdownMenuItem,
    separator: DropdownMenuSeparator,
    sub: DropdownMenuSub,
    subContent: DropdownMenuSubContent,
    subTrigger: DropdownMenuSubTrigger,
  },
};
const menuComponents = computed(() => menuComponentsByType[props.menuType]);

function handleAction(action: ProfileActionItem) {
  action.onClick(props.profile, {
    openComments: () => emit("openComments"),
    openPriority: () => emit("openPriority"),
    openChangeRuleActionType: () => emit("openChangeRuleActionType"),
  });
}

function isVisible(action: ProfileActionItem) {
  return action.visible?.(props.profile) ?? true;
}
</script>

<template>
  <template v-for="(actionsOrSeparator, index) in actionGroups" :key="index">
    <component
      :is="menuComponents.separator"
      v-if="actionsOrSeparator === 'separator'"
    />
    <component
      :is="menuComponents.group"
      v-else
    >
      <template v-for="action in actionsOrSeparator" :key="action.id">
        <component
          :is="menuComponents.sub"
          v-if="action.type === 'submenu'"
        >
          <component :is="menuComponents.subTrigger">
            {{ action.label(profile) }}
          </component>
          <component :is="menuComponents.subContent" class="min-w-44">
            <template
              v-for="childAction in action.children(profile)"
              :key="childAction.id"
            >
              <component
                :is="menuComponents.separator"
                v-if="childAction.type === 'separator'"
              />
              <component
                :is="menuComponents.item"
                v-else-if="isVisible(childAction)"
                :class="{ 'pl-6.5': childAction.inset }"
                :disabled="childAction.disabled?.(profile)"
                :variant="childAction.variant"
                @click="handleAction(childAction)"
              >
                <template v-if="childAction.content?.type === 'profileGroup'">
                  <span
                    class="size-2.5 shrink-0 rounded-full"
                    :style="{ backgroundColor: childAction.content.group.color }"
                  />
                  <ProfileGroupDisplayName
                    :group="childAction.content.group"
                    :profiles="childAction.content.profiles"
                  />
                </template>
                <template v-else>
                  {{ childAction.label(profile) }}
                </template>
              </component>
            </template>
          </component>
        </component>

        <component
          :is="menuComponents.item"
          v-else-if="isVisible(action)"
          :disabled="action.disabled?.(profile)"
          :variant="action.variant"
          @click="handleAction(action)"
        >
          <template v-if="action.content?.type === 'profileGroup'">
            <span
              class="size-2.5 shrink-0 rounded-full"
              :style="{ backgroundColor: action.content.group.color }"
            />
            <ProfileGroupDisplayName
              :group="action.content.group"
              :profiles="action.content.profiles"
            />
          </template>
          <template v-else>
            {{ action.label(profile) }}
          </template>
        </component>
      </template>
    </component>
  </template>
</template>
