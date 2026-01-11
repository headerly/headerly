<script setup lang="ts">
import { Button } from "#/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { ref, useTemplateRef } from "vue";
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
        <Button
          variant="outline"
          size="icon"
          :class="cn('btn btn-square btn-sm btn-primary', className)"
          @click="() => {
            dialogRef?.showModal()
          }"
        >
          <i class="i-lucide-cross size-4" />
        </Button>
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
          class="btn btn-circle btn-ghost btn-sm absolute top-2 right-2"
          @click="() => {
            dialogRef?.close()
          }"
        >
          <i class="i-lucide-x size-4" />
          <span class="sr-only">Close modal</span>
        </button>
      </form>

      <div class="tabs-box tabs mt-5">
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
              tab-content border-base-300 mt-1 max-h-[70vh] overflow-y-auto
            "
          >
            <div class="list rounded-box">
              <button
                v-for="{ title, description, action, disabled } in tab.items"
                :key="title"
                :disabled
                class="list-row btn btn-ghost h-min text-start"
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
