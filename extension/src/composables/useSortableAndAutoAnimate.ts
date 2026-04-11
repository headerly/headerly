import type { ShallowRef } from "vue";
import autoAnimate from "@formkit/auto-animate";
import { useSortable } from "@vueuse/integrations/useSortable";
import { nextTick, watch } from "vue";

interface UseSortableAndAutoAnimateOptions<T> {
  listContainer: Readonly<ShallowRef<HTMLElement | null>>;
  list: T[];
  handle?: string;
}
export function useSortableAndAutoAnimate<T>(options: UseSortableAndAutoAnimateOptions<T>) {
  let enableAutoAnimate: ((enabled: boolean) => void) | undefined;

  function setSortingState(isSorting: boolean) {
    options.listContainer.value?.toggleAttribute("data-sorting", isSorting);
  }

  watch(options.listContainer, (element) => {
    if (!element) {
      return;
    }

    const controller = autoAnimate(element);
    enableAutoAnimate = (enabled) => {
      if (enabled) {
        controller.enable();
      } else {
        controller.disable();
      }
    };
  }, { flush: "post" });

  useSortable(options.listContainer, options.list, {
    animation: 250,
    handle: options.handle,
    ghostClass: "sortable-ghost",
    watchElement: true,
    // The transform of sorting animations creates a new stacking context,
    // which may cause the currently dragged item to be covered by its sibling elements.
    chosenClass: "z-10",
    selectedClass: "z-10",
    onUpdate: ({ newIndex, oldIndex }) => {
      if (newIndex === undefined || oldIndex === undefined) {
        return;
      }
      const list = options.list;
      if (oldIndex >= 0 && oldIndex < list.length
        && newIndex >= 0 && newIndex < list.length) {
        const movedItem = list.splice(oldIndex, 1)[0]!;
        list.splice(newIndex, 0, movedItem);
      }
    },
    onStart: () => {
      setSortingState(true);
      enableAutoAnimate?.(false);
    },
    onEnd: async () => {
      // Re-enable auto-animate after the DOM has been updated with the new order.
      await nextTick();
      setSortingState(false);
      enableAutoAnimate?.(true);
    },
  });
}
