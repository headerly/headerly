<script setup lang="ts">
import type * as Monaco from "modern-monaco/editor-core";
import type { HTMLAttributes } from "vue";
import { useDark } from "@vueuse/core";
import * as monaco from "modern-monaco/editor-core";
import { setup as setupJsonLanguageService } from "modern-monaco/lsp/json/setup";
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from "vue";
import { profileExchangeJsonSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";

const model = defineModel<string>({ required: true });

const {
  readonly = false,
  height = "100%",
  width = "100%",
  class: className,
} = defineProps<{
  readonly?: boolean;
  height?: string;
  width?: string;
  searchPanelStickyTop?: string;
  class?: HTMLAttributes["class"];
}>();

const editorElement = useTemplateRef<HTMLDivElement>("editorElement");
const editorInstance = shallowRef<Monaco.editor.IStandaloneCodeEditor>();
const dark = useDark();
const modelUri = monaco.Uri.parse("inmemory://headerly/profile-exchange.json");

let jsonLanguageServicePromise: Promise<void> | undefined;

function setupMonacoEnvironment() {
  globalThis.MonacoEnvironment = {
    getWorker: (_workerId, label) => {
      if (label === "editorWorkerService") {
        return monaco.createEditorWorkerMain();
      }
      throw new Error(`Unexpected Monaco worker label: ${label}`);
    },
  };

  if (!document.querySelector("style[data-headerly-monaco]")) {
    const style = document.createElement("style");
    style.dataset.headerlyMonaco = "";
    style.textContent = monaco.cssBundle;
    document.head.append(style);
  }
}

function setupJsonLanguageServiceOnce() {
  jsonLanguageServicePromise ??= setupJsonLanguageService(monaco, "json", {
    importMapCodeLens: false,
    schemas: [{
      uri: "inmemory://headerly/profile-exchange.schema.json",
      fileMatch: ["**/profile-exchange.json"],
      schema: profileExchangeJsonSchema,
    }],
  });
  return jsonLanguageServicePromise;
}

onMounted(async () => {
  const element = editorElement.value;
  if (!element) {
    return;
  }

  setupMonacoEnvironment();
  await setupJsonLanguageServiceOnce();

  const editorModel = monaco.editor.createModel(model.value, "json", modelUri);
  const instance = monaco.editor.create(element, {
    automaticLayout: true,
    fontFamily: "Roboto Mono Variable",
    fontSize: 14,
    minimap: { enabled: false },
    model: editorModel,
    readOnly: readonly,
    scrollBeyondLastLine: false,
    theme: dark.value ? "vs-dark" : "vs",
    wordWrap: "on",
  });
  editorInstance.value = instance;
  instance.onDidChangeModelContent(() => {
    model.value = editorModel.getValue();
  });
});

watch(model, (value) => {
  const editorModel = editorInstance.value?.getModel();
  if (editorModel && value !== editorModel.getValue()) {
    editorModel.setValue(value);
  }
});

watch(dark, (isDark) => {
  monaco.editor.setTheme(isDark ? "vs-dark" : "vs");
});

watch(() => readonly, (isReadonly) => {
  editorInstance.value?.updateOptions({ readOnly: isReadonly });
});

onBeforeUnmount(() => {
  const editorModel = editorInstance.value?.getModel();
  editorInstance.value?.dispose();
  editorModel?.dispose();
});
</script>

<template>
  <div
    ref="editorElement"
    :class="cn('min-h-0 text-base shadow-xs outline-none', className)"
    :style="{ height, width }"
  />
</template>
