import type { vAutoAnimate } from "@formkit/auto-animate/vue";

declare module "vue" {
  export interface GlobalDirectives {
    vAutoAnimate: typeof vAutoAnimate;
  }
  export interface HTMLAttributes {
    popover?: "auto" | "manual" | "" | boolean;
    popovertarget?: string;
    popovertargetaction?: "toggle" | "show" | "hide";
  }
}
