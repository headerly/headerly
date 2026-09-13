import type { Zoom } from "medium-zoom";
import type { Theme } from "vitepress";
import mediumZoom from "medium-zoom";
import { useData, useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme";
// https://vitepress.dev/guide/custom-theme
import { defineAsyncComponent, defineComponent, h, nextTick, onMounted, onUnmounted, watch } from "vue";
import HeaderLogo from "./components/HeaderLogo.vue";
import "@fontsource-variable/inter/wght-italic.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "@fontsource-variable/roboto-mono";
import "./style.css";

const HomePage = defineAsyncComponent(() => import("./components/home/HomePage.vue"));

const Layout = defineComponent({
  setup() {
    const route = useRoute();
    const { frontmatter } = useData();
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

    return () => h(DefaultTheme.Layout, null, {
      "nav-bar-title-before": () => h(HeaderLogo),
      "home-hero-before": () => frontmatter.value.headerlyHome ? h(HomePage) : null,
    });
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
