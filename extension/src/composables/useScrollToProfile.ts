import { onMounted, ref } from "vue";

interface UseScrollToProfileOptions {
  scrollTargetIdOnMounted?: string;
}
export function useScrollToProfile(options: UseScrollToProfileOptions = {}) {
  const { scrollTargetIdOnMounted } = options;

  // Vue cannot guarantee the order of refs,
  // and must use id map management to ensure access to the correct element.
  const profileRefs = ref<Map<string, HTMLElement>>(new Map());

  function scrollToProfile(profileId: string, behavior: ScrollBehavior) {
    const target = profileRefs.value.get(profileId);
    if (target) {
      target.scrollIntoView({ behavior, block: "end" });
    }
  }

  function setRef(el: HTMLElement | null, profileId: string) {
    if (el === null) {
      profileRefs.value.delete(profileId);
    } else {
      profileRefs.value.set(profileId, el as HTMLDivElement);
    }
  }

  onMounted(() => {
    if (scrollTargetIdOnMounted) {
      scrollToProfile(scrollTargetIdOnMounted, "instant");
    }
  });

  return {
    setRef,
    scrollToProfile,
  };
}
