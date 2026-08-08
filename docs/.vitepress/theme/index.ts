import type { Zoom } from "medium-zoom";
import type { Theme } from "vitepress";
import mediumZoom from "medium-zoom";
import { useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme";
// https://vitepress.dev/guide/custom-theme
import { defineComponent, h, nextTick, onMounted, onUnmounted, watch } from "vue";
import "./style.css";

const Layout = defineComponent({
  setup() {
    const route = useRoute();
    let zoom: Zoom | undefined;

    async function refreshZoom() {
      await nextTick();
      zoom?.detach();
      zoom?.attach("img:not(.no-zoom)");
    }

    onMounted(() => {
      zoom = mediumZoom({
        background: "var(--vp-c-bg)",
        margin: 24,
      });
      void refreshZoom();
    });

    watch(
      () => route.path,
      () => void refreshZoom(),
      { flush: "post" },
    );

    onUnmounted(() => zoom?.detach());

    return () => h(DefaultTheme.Layout);
  },
});

export default {
  extends: DefaultTheme,
  Layout,
  // eslint-disable-next-line unused-imports/no-unused-vars
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme;
