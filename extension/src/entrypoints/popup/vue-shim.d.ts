import type { vAutoAnimate } from "@formkit/auto-animate/vue";

declare module "vue" {
  export interface GlobalDirectives {
    vAutoAnimate: typeof vAutoAnimate;
  }
  export interface HTMLAttributes {
    popover?: boolean;
    popovertarget?: string;
    popovertargetaction?: "hide";
  }
}
