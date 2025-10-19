<script setup lang="ts">
import type { ActionType } from "#/stores/useProfilesStore";
import type { UUID } from "node:crypto";
import type { HeaderMod, ModGroupType } from "@/lib/storage";
import { findHeaderModGroup, findHeaderModGroups, useProfilesStore } from "#/stores/useProfilesStore";
import { head } from "es-toolkit";
import { computed } from "vue";
import { createMod } from "@/lib/storage";
import ModField from "./components/ModFieldWithActions.vue";

const { actionType, groupId, mods, groupType } = defineProps<{
  actionType: ActionType;
  mods: HeaderMod[];
  groupId: UUID;
  groupType: ModGroupType;
}
>();

const profilesStore = useProfilesStore();

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

const indeterminate = computed(() => {
  if (groupType === "checkbox") {
    return mods.some(mod => mod.enabled) && !mods.every(mod => mod.enabled);
  }
  return false;
});

const checked = computed(() => {
  if (groupType === "checkbox") {
    return mods.every(mod => mod.enabled);
  }
  return mods.some(mod => mod.enabled);
});
</script>

<template>
  <fieldset
    v-auto-animate
    class="fieldset w-full rounded-box border border-base-300 bg-base-200 p-4"
  >
    <legend class="fieldset-legend text-base font-medium">
      <label>
        <input
          type="checkbox"
          class="checkbox checkbox-sm"
          :checked
          :indeterminate
          @change="(e) => {
            const checked = (e.target as HTMLInputElement).checked;
            if (groupType === 'checkbox'){
              mods.forEach(mod => {
                mod.enabled = checked;
              });
            }
            else if (checked){
              const firstMod = head(mods);
              if (firstMod) firstMod.enabled = checked;
            }
            else {
              mods.forEach(mod => {
                mod.enabled = false;
              });
            }
          }"
        >
      </label>
      {{ actionType === "request" ? "Request Headers" : "Response Headers" }}
      <div class="flex gap-1">
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
    </legend>
    <div
      v-for="mod, index in mods"
      :key="mod.id"
      class="flex flex-col gap-1.5"
    >
      <div class="flex items-center justify-between gap-1">
        <ModField
          :index
          :mod
          :action-type
          :current-mods-length="mods.length"
          @update:name="(value) => mod.name = value"
          @update:value="(value) => {
            if (mod.operation !== 'remove') {
              mod.value = value
            }
          }"
          @update:operation="(value) => mod.operation = value"
          @update:comments="(value) => mod.comments = value"
          @duplicate="duplicateHeaderMod(mod.id)"
          @move-up="moveUpHeaderMod(mod.id)"
          @move-down="moveDownHeaderMod(mod.id)"
          @delete="deleteHeaderMod(mod.id)"
        >
          <template #field-before>
            <input
              v-if="groupType === 'checkbox'"
              v-model="mod.enabled"
              type="checkbox"
              class="checkbox checkbox-sm"
            >
            <input
              v-else
              v-model="mod.enabled"
              type="checkbox"
              class="radio size-5"
              @click="() => {
                mods.forEach(m => {
                  if (m.id === mod.id) {
                    m.enabled = true;
                    return;
                  }
                  m.enabled = false;
                });
              }"
            >
          </template>
        </ModField>
      </div>
    </div>
  </fieldset>
</template>
