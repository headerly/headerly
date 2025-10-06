<script setup lang="tsx">
import { useProfilesStore } from "#/stores/useProfilesStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const profilesStore = useProfilesStore();

const filterFields = [
  {
    key: "urlFilter",
    title: "URL Filter",
    placeholder: "||google.com/",
    description: (
      <>
        <p>
          <a
            href="https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#url_filter_syntax"
            target="_blank"
          >
            URL pattern syntax
          </a>
        </p>
        <ul>
          <li>
            <code>*</code>
            — Wildcard: matches any characters.
          </li>
          <li>
            <code>|</code>
            — Anchor: marks start or end of the URL.
          </li>
          <li>
            <code>||</code>
            — Domain anchor: matches start of a (sub)domain.
          </li>
          <li>
            <code>^</code>
            — Separator: matches anything except letters, digits,
            <code>_ - . %</code>
            , or end of URL.
          </li>
        </ul>
        <p>
          Format: (optional anchor) + pattern + (optional anchor)
        </p>
        <p>Omitted = all URLs match. Empty string not allowed.</p>
        <p>Note: Only one of urlFilter or regexFilter can be used.</p>
      </>
    ),
  },
  {
    key: "regexFilter",
    title: "Regex Filter",
    placeholder: "^.*\\.google.com/.*",
    description: (
      <>
        <p>
          The rule will only match network requests whose URL matches the
          specified regular expression. An empty string is not allowed.
        </p>
        <p>
          This follows the
          {" "}
          <a href="https://github.com/google/re2/wiki/syntax" target="_blank">RE2 syntax</a>
          .
        </p>
        <p>Note: Only one of urlFilter or regexFilter can be used.</p>
      </>
    ),
  },
] as const;
</script>

<template>
  <div
    v-auto-animate
    class="flex w-full flex-col"
  >
    <template v-for="filter in filterFields">
      <fieldset
        v-if="profilesStore.selectedProfile.filters[filter.key]"
        :key="filter.key"
        class="
          fieldset w-full rounded-box border border-base-300 bg-base-200 p-4
        "
      >
        <legend class="fieldset-legend text-base font-medium">
          <label>
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              :checked="profilesStore.selectedProfile.filters[filter.key]!.enabled"
            >
          </label>
          {{ filter.title }}
          <div class="flex items-center gap-1">
            <TooltipProvider :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <button
                    class="btn btn-square btn-ghost btn-xs btn-primary"
                  >
                    <i class="i-lucide-circle-question-mark size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  :collision-padding="20"
                  side="top"
                  class="prose prose-sm max-h-40 max-w-lg overflow-y-auto"
                >
                  <Component :is="filter.description" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button
              class="btn btn-square btn-ghost btn-xs btn-error"
            >
              <i class="i-lucide-trash size-4" />
            </button>
          </div>
        </legend>
        <div
          class="flex flex-col gap-1.5"
        >
          <div class="flex items-center justify-between gap-1">
            <label class="label flex-1">
              <input
                v-model="profilesStore.selectedProfile.filters[filter.key]!.value"
                type="text"
                :placeholder="filter.placeholder"
                class="
                  input input-sm w-full text-base text-base-content
                  placeholder:font-mono
                "
              >
            </label>
          </div>
        </div>
      </fieldset>
    </template>
  </div>
</template>
