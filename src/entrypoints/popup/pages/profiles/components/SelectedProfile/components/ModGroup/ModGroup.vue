<script setup lang="ts">
import type { ActionType } from "#/stores/useProfilesStore";
import type { UUID } from "node:crypto";
import type { HeaderMod, ModGroupType } from "@/lib/storage";
import Group from "#/components/group/Group.vue";
import { findHeaderModGroup, findHeaderModGroups, useProfilesStore } from "#/stores/useProfilesStore";
import { computed } from "vue";
import { createMod } from "@/lib/storage";
import { cn } from "@/lib/utils";
import ModField from "./components/ModFieldWithActions.vue";

const { actionType, groupId, groupType } = defineProps<{
  actionType: ActionType;
  groupId: UUID;
  groupType: ModGroupType;
}
>();

const profilesStore = useProfilesStore();

const mods = computed<HeaderMod[]>(() => {
  const group = findHeaderModGroup(profilesStore.selectedProfile, actionType, groupId);
  return group ? group.mods : [];
});

function deleteHeaderMod(modId: UUID) {
  const group = findHeaderModGroup(profilesStore.selectedProfile, actionType, groupId);
  if (group) {
    group.mods = group.mods.filter(mod => mod.id !== modId);
  }
}

function duplicateHeaderMod(modId: UUID) {
  const group = findHeaderModGroup(profilesStore.selectedProfile, actionType, groupId);
  const targetMod = group?.mods.find(m => m.id === modId);
  if (!targetMod || !group) {
    return;
  }
  const newMod = { ...targetMod, id: crypto.randomUUID() };
  group.mods.push(newMod);
}

function moveUpHeaderMod(modId: UUID) {
  const group = findHeaderModGroup(profilesStore.selectedProfile, actionType, groupId);
  if (!group)
    return;
  const mods = group.mods;
  const index = mods.findIndex(m => m.id === modId);
  if (index > 0) {
    const [mod] = mods.splice(index, 1);
    mods.splice(index - 1, 0, mod!);
  }
}

function moveDownHeaderMod(modId: UUID) {
  const group = findHeaderModGroup(profilesStore.selectedProfile, actionType, groupId);
  if (!group)
    return;
  const mods = group.mods;
  const index = mods.findIndex(m => m.id === modId);
  if (index >= 0 && index < mods.length - 1) {
    const [mod] = mods.splice(index, 1);
    mods.splice(index + 1, 0, mod!);
  }
}

function addModToGroup() {
  const mod = createMod({
    enabled: groupType === "checkbox",
  });
  const group = findHeaderModGroup(profilesStore.selectedProfile, actionType, groupId);
  if (group) {
    group.mods.push(mod);
  }
}

function deleteMod() {
  const groups = findHeaderModGroups(profilesStore.selectedProfile, actionType);
  const index = groups.findIndex(group => group.id === groupId);
  if (index !== -1) {
    groups.splice(index, 1);
  }
}

function transferGroupType() {
  const profile = profilesStore.selectedProfile;
  const group = findHeaderModGroup(profile, actionType, groupId);
  if (!group)
    return;

  if (group.type === "checkbox") {
    group.type = "radio";
    const firstEnabledMod = group.mods.find(mod => mod.enabled);
    group.mods.forEach((mod) => {
      mod.enabled = mod === firstEnabledMod;
    });
  } else {
    group.type = "checkbox";
  }
}

const idToModMap = computed(() => {
  return new Map<UUID, HeaderMod>(
    mods.value.map(mod => [mod.id, mod]),
  );
});
</script>

<template>
  <Group
    v-model="mods"
    :name="actionType === 'request' ? 'Request Headers' : 'Response Headers'"
    :type="groupType"
  >
    <template #name-after>
      <div class="flex gap-1">
        <button
          :class="cn('btn btn-square btn-ghost btn-xs', {
            'btn-info': groupType === 'checkbox',
            'btn-accent': groupType === 'radio',
          })"
          @click="transferGroupType"
        >
          <i
            :class="cn('size-4', groupType === 'checkbox'
              ? `i-lucide-square-check-big` : `i-lucide-circle-dot`)"
          />
        </button>
        <button
          class="btn btn-square btn-ghost btn-xs btn-primary"
          @click="addModToGroup"
        >
          <i class="i-lucide-cross size-4" />
        </button>
        <button
          class="btn btn-square btn-ghost btn-xs btn-error"
          @click="deleteMod"
        >
          <i class="i-lucide-trash size-4" />
        </button>
      </div>
    </template>
    <template #item="{ id, index }">
      <ModField
        :mod="idToModMap.get(id)!"
        :action-type="actionType"
        :index="index"
        :current-mods-length="mods.length"
        @delete="deleteHeaderMod(id)"
        @duplicate="duplicateHeaderMod(id)"
        @move-up="moveUpHeaderMod(id)"
        @move-down="moveDownHeaderMod(id)"
        @update:value="(newValue: string) => {
          const mod = idToModMap.get(id)!;
          if (mod.operation !== 'remove') {
            mod.value = newValue;
          }
        }"
        @update:operation="(newOperation) => {
          idToModMap.get(id)!.operation = newOperation;
        }"
      />
    </template>
  </Group>
</template>
