<script setup lang="ts">
import type { Panel } from "@codemirror/view";
import type { HTMLAttributes } from "vue";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { search, searchKeymap } from "@codemirror/search";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { profileExchangeEditorJsonSchema } from "@headerly/schema";
import { cn } from "@headerly/ui/lib/utils";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { useDark } from "@vueuse/core";
import { jsonSchema } from "codemirror-json-schema";
import { computed, createApp, h } from "vue";
import CodeMirror from "vue-codemirror6";
import { i18n } from "#/i18n";
import { useJsonValidation } from "@/composables/useJsonValidation";
import JsonSearchPanel from "./JsonSearchPanel.vue";
import { darkTheme, lightTheme } from "./theme";
import ValidationErrors from "./ValidationErrors.vue";

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

const { validationErrors } = useJsonValidation(model);

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
    jsonSchema(profileExchangeEditorJsonSchema),
    indentationMarkers({
      colors: {
        light: "var(--border)",
        dark: "var(--border)",
        activeLight: "var(--ring)",
        activeDark: "var(--ring)",
      },
    }),
    dark.value ? darkTheme : lightTheme,
  ];
});
</script>

<template>
  <div :class="cn('relative min-h-0 min-w-0', className)" :style="{ height, width }">
    <CodeMirror
      v-model="model"
      class="size-full text-base shadow-xs outline-none"
      :lang
      :dark
      :linter
      basic
      wrap
      :extensions
      :readonly
    />
    <ValidationErrors v-if="model.trim() && validationErrors.length" :errors="validationErrors" />
  </div>
</template>

<style>
@reference "tailwindcss";
.cm-editor {
  width: 100%;
  height: 100%;
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
