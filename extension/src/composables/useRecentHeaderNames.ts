import type { Ref } from "vue";
import type { ActionType } from "@/lib/types";
import { useLocalStorage } from "@vueuse/core";

const RECENT_HEADER_NAMES_LIMIT = 4;
const RECENT_HEADER_NAMES_STORAGE_KEYS = {
  request: "recent-request-header-names",
  response: "recent-response-header-names",
} as const satisfies Record<ActionType, string>;
const recentHeaderNameRefs = new Map<ActionType, Ref<string[]>>();

export function addNameToRecentHeaderNames(recentHeaderNames: string[], name: string) {
  const normalizedName = name.trim().toLocaleLowerCase();
  if (!normalizedName)
    return recentHeaderNames;

  return [
    normalizedName,
    ...recentHeaderNames.filter(
      recentName => recentName.toLocaleLowerCase() !== normalizedName,
    ),
  ].slice(0, RECENT_HEADER_NAMES_LIMIT);
}

export function removeNameFromRecentHeaderNames(recentHeaderNames: string[], name: string) {
  const normalizedName = name.toLocaleLowerCase();
  return recentHeaderNames.filter(
    recentName => recentName.toLocaleLowerCase() !== normalizedName,
  );
}

function getRecentHeaderNameRef(actionType: ActionType) {
  const existingRef = recentHeaderNameRefs.get(actionType);
  if (existingRef)
    return existingRef;

  const recentHeaderNames = useLocalStorage<string[]>(
    RECENT_HEADER_NAMES_STORAGE_KEYS[actionType],
    [],
  );
  if (recentHeaderNames.value.length > RECENT_HEADER_NAMES_LIMIT)
    recentHeaderNames.value = recentHeaderNames.value.slice(0, RECENT_HEADER_NAMES_LIMIT);

  recentHeaderNameRefs.set(actionType, recentHeaderNames);
  return recentHeaderNames;
}

export function useRecentHeaderNames(actionType: ActionType) {
  const recentHeaderNames = getRecentHeaderNameRef(actionType);

  function addRecentHeaderName(name: string) {
    recentHeaderNames.value = addNameToRecentHeaderNames(recentHeaderNames.value, name);
  }

  function removeRecentHeaderName(name: string) {
    recentHeaderNames.value = removeNameFromRecentHeaderNames(recentHeaderNames.value, name);
  }

  return {
    recentHeaderNames,
    addRecentHeaderName,
    removeRecentHeaderName,
  };
}
