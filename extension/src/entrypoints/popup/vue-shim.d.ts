import type { vAutoAnimate } from "@formkit/auto-animate/vue";

declare module "@vue/runtime-core" {
  export interface ComponentCustomDirectives {
    vAutoAnimate: typeof vAutoAnimate;
  }
}
