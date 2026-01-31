import type { EventBusKey } from "@vueuse/core";

export const openAddModModalKey: EventBusKey<{ target: "actions" | "conditions" }> = Symbol("open-add-mod-modal");
