<script setup lang="ts">
import type { EditorView } from "@codemirror/view";
import {
  closeSearchPanel,
  findNext,
  findPrevious,
  getSearchQuery,
  replaceAll,
  replaceNext,
  SearchQuery,
  setSearchQuery,
} from "@codemirror/search";
import { runScopeHandlers } from "@codemirror/view";
import { match } from "ts-pattern";
import { nextTick, onMounted, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "#/ui/button";
import { Toggle } from "#/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { cn } from "@/lib/utils";

type SearchCommand = (view: EditorView) => boolean;

const props = defineProps<{
  view: EditorView;
}>();

const { t } = useI18n();

const searchInputRef = useTemplateRef<HTMLInputElement>("searchInputRef");
const replaceInputRef = useTemplateRef<HTMLInputElement>("replaceInputRef");
const searchText = ref("");
const replaceText = ref("");
const caseSensitive = ref(false);
const replaceExpanded = ref(false);
const regexp = ref(false);
const wholeWord = ref(false);

watch([searchText, replaceText, caseSensitive, regexp, wholeWord], updateSearchQuery);

onMounted(async () => {
  const query = getSearchQuery(props.view.state);
  searchText.value = query.search;
  replaceText.value = query.replace;
  caseSensitive.value = query.caseSensitive;
  regexp.value = query.regexp;
  wholeWord.value = query.wholeWord;
  await nextTick();
  searchInputRef.value?.focus();
});

const searchOptions = [
  {
    labelKey: "jsonEditor.search.matchCase",
    icon: "i-lucide-case-sensitive",
    model: caseSensitive,
  },
  {
    labelKey: "jsonEditor.search.matchWholeWord",
    icon: "i-lucide-whole-word",
    model: wholeWord,
  },
  {
    labelKey: "jsonEditor.search.useRegularExpression",
    icon: "i-lucide-regex",
    model: regexp,
  },
] as const;

function updateSearchQuery() {
  const previous = getSearchQuery(props.view.state);
  const next = new SearchQuery({
    search: searchText.value,
    replace: replaceText.value,
    caseSensitive: caseSensitive.value,
    regexp: regexp.value,
    wholeWord: wholeWord.value,
  });

  if (!next.eq(previous)) {
    props.view.dispatch({
      effects: setSearchQuery.of(next),
    });
  }
}

function runSearchCommand(command: SearchCommand) {
  updateSearchQuery();
  return command(props.view);
}

function handleSearchSubmit(event: KeyboardEvent) {
  runSearchCommand(match(event.shiftKey)
    .with(true, () => findPrevious)
    .with(false, () => findNext)
    .exhaustive());
}

function handleReplaceSubmit() {
  runSearchCommand(replaceNext);
}

function handleSearchPanelKeydown(event: KeyboardEvent) {
  // This enables CodeMirror's search panel keyboard shortcuts.
  if (runScopeHandlers(props.view, event, "search-panel")) {
    event.preventDefault();
  }
}

async function toggleReplaceExpanded() {
  replaceExpanded.value = !replaceExpanded.value;

  if (replaceExpanded.value) {
    await nextTick();
    replaceInputRef.value?.focus();
  }
}

const searchPanelActions = [
  {
    labelKey: "jsonEditor.search.previousMatch",
    icon: "i-lucide-arrow-up",
    run: () => runSearchCommand(findPrevious),
  },
  {
    labelKey: "jsonEditor.search.nextMatch",
    icon: "i-lucide-arrow-down",
    run: () => runSearchCommand(findNext),
  },
  {
    labelKey: "jsonEditor.search.closeSearch",
    icon: "i-lucide-x",
    run: () => closeSearchPanel(props.view),
  },
] as const;

const replacePanelActions = [
  {
    labelKey: "jsonEditor.search.replace",
    icon: "i-lucide-replace",
    run: () => runSearchCommand(replaceNext),
  },
  {
    labelKey: "jsonEditor.search.replaceAll",
    icon: "i-lucide-replace-all",
    run: () => runSearchCommand(replaceAll),
  },
] as const;
</script>

<template>
  <div
    class="
      grid grid-cols-[1.5rem_minmax(0,1fr)_auto] gap-1 border-b bg-background
      p-1.5 text-sm text-foreground
    "
    @keydown="handleSearchPanelKeydown"
  >
    <div :class="cn('flex items-center', replaceExpanded && 'row-span-2')">
      <Button
        type="button"
        size="icon-xs"
        :class="cn('h-full w-6')"
        variant="ghost"
        @click="toggleReplaceExpanded"
      >
        <span class="sr-only">
          {{ t("jsonEditor.search.toggleReplace") }}
        </span>
        <i
          :class="cn(
            'size-4 transition-transform',
            replaceExpanded && 'rotate-90',
            'i-lucide-chevron-right',
          )"
        />
      </Button>
    </div>

    <div
      class="flex h-8 min-w-0 items-center rounded-sm bg-muted"
    >
      <input
        ref="searchInputRef"
        v-model="searchText"
        main-field="true"
        class="
          h-full min-w-0 flex-1 px-2 text-sm outline-none
          placeholder:text-muted-foreground
        "
        :placeholder="t('jsonEditor.search.findPlaceholder')"
        @keydown.enter="handleSearchSubmit"
      >

      <div class="flex shrink-0 items-center gap-0.5 px-1">
        <TooltipProvider>
          <Tooltip
            v-for="option in searchOptions"
            :key="option.labelKey"
          >
            <!-- Tooltip and Toggle share the same `data-state` attribute, so using as-child directly causes the state to behave incorrectly. -->
            <TooltipTrigger as="div">
              <Toggle
                :model-value="option.model.value"
                size="sm"
                type="button"
                class="
                  size-6! min-w-auto!
                  hover:bg-brand/30 hover:text-primary
                  data-[state=on]:bg-brand/30
                "
                @update:model-value="(v) => {
                  option.model.value = v
                }"
              >
                <i :class="cn('size-4', option.icon)" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="10">
              {{ t(option.labelKey) }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip
          v-for="action in searchPanelActions"
          :key="action.labelKey"
        >
          <TooltipTrigger as-child>
            <Button
              type="button"
              size="icon-sm"
              class="size-6"
              variant="ghost"
              @click="action.run"
            >
              <i :class="cn('size-4', action.icon)" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" :side-offset="10" :collision-padding="8">
            {{ t(action.labelKey) }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

    <template v-if="replaceExpanded">
      <div
        class="col-start-2 flex h-8 min-w-0 items-center rounded-sm bg-muted"
      >
        <input
          ref="replaceInputRef"
          v-model="replaceText"
          class="
            h-full min-w-0 flex-1 px-2 text-sm outline-none
            placeholder:text-muted-foreground
          "
          :placeholder="t('jsonEditor.search.replacePlaceholder')"
          @keydown.enter="handleReplaceSubmit"
        >
      </div>

      <div class="col-start-3 flex items-center gap-1">
        <TooltipProvider>
          <Tooltip
            v-for="action in replacePanelActions"
            :key="action.labelKey"
          >
            <TooltipTrigger as-child>
              <Button
                type="button"
                size="icon-sm"
                class="size-6"
                variant="ghost"
                @click="action.run"
              >
                <i :class="cn('size-4', action.icon)" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="10" :collision-padding="8">
              {{ t(action.labelKey) }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </template>
  </div>
</template>
