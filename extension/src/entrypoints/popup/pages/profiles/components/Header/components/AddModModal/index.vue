<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/entrypoints/popup/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { tabs } from ".";

const { defaultTab, class: className } = defineProps<{
  defaultTab: "actions" | "conditions";
  class?: string;
  tooltipText: string;
}>();

const currentTab = ref<typeof defaultTab>(defaultTab);

const dialogRef = useTemplateRef("dialogRef");
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          :class="cn('btn btn-square btn-sm btn-primary', className)"
          @click="() => {
            dialogRef?.showModal()
          }"
        >
          <i class="i-lucide-cross size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {{ tooltipText }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <dialog ref="dialogRef" class="modal text-base-content">
    <div class="modal-box">
      <form method="dialog">
        <button
          class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm"
          @click="() => {
            dialogRef?.close()
          }"
        >
          <i class="i-lucide-x size-4" />
          <span class="sr-only">Close modal</span>
        </button>
      </form>

      <div class="tabs-box mt-5 tabs">
        <template v-for="tab in tabs" :key="tab.value">
          <label class="tab w-1/2">
            <input
              v-model="currentTab"
              :value="tab.value"
              type="radio"
            >
            <i :class="tab.icon" class="me-2 size-4" />
            {{ tab.label }}
          </label>
          <div
            class="
              tab-content mt-1 max-h-[70vh] overflow-y-auto border-base-300
            "
          >
            <div class="list rounded-box">
              <button
                v-for="{ title, description, action, disabled } in tab.items"
                :key="title"
                :disabled="disabled"
                class="list-row btn h-min text-start btn-ghost"
                :class="{ 'btn-disabled opacity-50': disabled }"
                @click="() => {
                  action()
                  dialogRef?.close()
                }"
              >
                <div>
                  <div>{{ title }}</div>
                  <div class="text-xs font-normal opacity-60">
                    {{ description }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button
        @click="() => {
          dialogRef?.close()
        }"
      >
        <span class="sr-only">
          Close modal
        </span>
      </button>
    </form>
  </dialog>
</template>
