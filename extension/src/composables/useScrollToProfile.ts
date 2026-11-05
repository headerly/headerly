import type { ShallowRef } from "vue";
import { onMounted } from "vue";

interface UseScrollToProfileOptions {
  scrollTargetIdOnMounted?: string;
}
export function useScrollToProfile(listContainer: Readonly<ShallowRef<HTMLElement | null>>, options: UseScrollToProfileOptions = {}) {
  const { scrollTargetIdOnMounted } = options;

  function scrollToProfile(profileId: string, behavior: ScrollBehavior) {
    const target = listContainer.value?.querySelector<HTMLElement>(`[data-profile-id="${CSS.escape(profileId)}"]`);
    if (target) {
      target.scrollIntoView({ behavior, block: "center" });
    }
  }

  onMounted(() => {
    if (scrollTargetIdOnMounted) {
      scrollToProfile(scrollTargetIdOnMounted, "instant");
    }
  });

  return {
    scrollToProfile,
  };
}
