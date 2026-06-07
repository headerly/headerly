<script setup lang="ts">
import type { Panel } from "@codemirror/view";
import type { HTMLAttributes } from "vue";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { search, searchKeymap } from "@codemirror/search";
import { Prec } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { useDark } from "@vueuse/core";
import { jsonSchema } from "codemirror-json-schema";
import { computed, createApp, h } from "vue";
import CodeMirror from "vue-codemirror6";
import { i18n } from "#/i18n";
import { profileExchangeJsonSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import JsonSearchPanel from "./JsonSearchPanel.vue";

const model = defineModel<string>({ required: true });

const {
  readonly = false,
  height = "100%",
  width = "100%",
  searchPanelStickyTop = "0px",
  class: className,
} = defineProps<{
  readonly?: boolean;
  height?: string;
  width?: string;
  searchPanelStickyTop?: string;
  class?: HTMLAttributes["class"];
}>();

const lang = json();
const linter = jsonParseLinter();

function createJsonSearchPanel(view: EditorView) {
  const dom = document.createElement("div");
  const app = createApp({
    render: () => h(JsonSearchPanel, {
      view,
    }),
  });
  app.use(i18n);

  return {
    dom,
    top: true,
    mount() {
      app.mount(dom);
    },
    destroy() {
      app.unmount();
    },
  } as const satisfies Panel;
}

const dark = useDark();
const extensions = computed(() => {
  return [
    // basicSetup includes its own searchKeymap from codemirror; run this one first so it uses our custom panel.
    Prec.highest(keymap.of(searchKeymap)),
    search({
      createPanel: createJsonSearchPanel,
      scrollToMatch: range => EditorView.scrollIntoView(range, { y: "center" }),
    }),
    // @ts-expect-error https://github.com/colinhacks/zod/discussions/5936
    jsonSchema(profileExchangeJsonSchema),
    indentationMarkers(),
    dark.value && oneDark,
  ].filter(Boolean);
});
</script>

<template>
  <CodeMirror
    v-model="model"
    :class="cn('text-base shadow-xs outline-none', className)"
    :lang
    :dark
    :linter
    basic
    wrap
    :extensions
    :readonly
  />
</template>

<style>
@reference "tailwindcss";
.cm-editor {
  width: v-bind(width);
  height: v-bind(height);
}

.cm-scroller {
  @apply font-mono!;
}

.cm-panels-top {
  top: v-bind(searchPanelStickyTop);
  z-index: 9;

  @apply border-none!;
}
</style>
