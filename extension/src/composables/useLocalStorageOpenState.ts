import type { Ref, WritableComputedRef } from "vue";
import { useStorage } from "@vueuse/core";
import { pick } from "es-toolkit";
import { computed } from "vue";

export const PROFILE_GROUP_OPEN_STATES_STORAGE_KEY = "profile-group-collapsible:open-states";
export const GROUP_OPEN_STATES_STORAGE_KEY = "group-collapsible:open-states";

type OpenStateRecord = Record<string, boolean>;

const openStateRecords = new Map<string, Ref<OpenStateRecord>>();

function getOpenStateRecord(storageKey: string) {
  return openStateRecords.getOrInsertComputed(storageKey, () => useStorage<OpenStateRecord>(storageKey, {}, localStorage));
}

export function useLocalStorageOpenState(
  uuid: string,
  storageKey: string,
): WritableComputedRef<boolean> {
  const openStateRecord = getOpenStateRecord(storageKey);

  return computed({
    get: () => openStateRecord.value[uuid] ?? true,
    set: (open: boolean) => {
      openStateRecord.value = {
        ...openStateRecord.value,
        [uuid]: open,
      };
    },
  });
}

export function useCleanupLocalStorageOpenStates(
  existingUuids: Iterable<string>,
  storageKey: string,
) {
  const openStateRecord = getOpenStateRecord(storageKey);
  const existingOpenStateRecord = pick(openStateRecord.value, [...existingUuids]);

  if (Object.keys(existingOpenStateRecord).length !== Object.keys(openStateRecord.value).length) {
    openStateRecord.value = existingOpenStateRecord;
  }
}
