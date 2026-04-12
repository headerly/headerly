<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { Button } from "#/ui/button";
import { Checkbox } from "#/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/ui/dialog";
import { Label } from "#/ui/label";
import { ref } from "vue";

const profile = defineModel<Profile>("profile", {
  required: true,
});

const STORAGE_KEY = "headerly:hideSessionRuleWarning";

const openState = ref(false);
const dontShowAgain = ref(false);

function open() {
  if (profile.value.ruleScope === "session") {
    // Session → Dynamic is safe, no warning needed
    profile.value.ruleScope = "dynamic";
    return;
  }

  // Dynamic → Session needs a warning
  if (localStorage.getItem(STORAGE_KEY) === "true") {
    profile.value.ruleScope = "session";
    return;
  }

  dontShowAgain.value = false;
  openState.value = true;
}

function handleConfirm() {
  if (dontShowAgain.value) {
    localStorage.setItem(STORAGE_KEY, "true");
  }
  profile.value.ruleScope = "session";
  openState.value = false;
}

defineExpose({
  open,
});
</script>

<template>
  <Dialog v-model:open="openState">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Switch to Session Rule</DialogTitle>
        <DialogDescription>
          <p>
            Session rules do not persist across browser restarts or extension updates.
            When the browser restarts or the extension is updated, session rules will be
            lost and the profile will be automatically paused.
          </p>
        </DialogDescription>
      </DialogHeader>
      <div class="flex items-center gap-2 py-2">
        <Checkbox
          id="dont-show-again"
          v-model:checked="dontShowAgain"
        />
        <Label for="dont-show-again" class="cursor-pointer">
          Don't show this again
        </Label>
      </div>
      <DialogFooter class="flex flex-row justify-end gap-2">
        <DialogClose as-child>
          <Button variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button @click="handleConfirm">
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
