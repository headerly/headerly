import type { VariantProps } from "class-variance-authority";
import type { ComputedRef, InjectionKey } from "vue";
import { cva } from "class-variance-authority";

export { default as ToggleGroup } from "./ToggleGroup.vue";
export { default as ToggleGroupItem } from "./ToggleGroupItem.vue";

export const toggleGroupVariants = cva(
  `
    flex w-fit items-center rounded-md
    data-[variant=outline]:shadow-xs
    [&>*:focus-visible]:relative [&>*:focus-visible]:z-10
    [&>[data-slot=toggle-group-item]:not(:first-child)]:rounded-l-none
    [&>[data-slot=toggle-group-item]:not(:first-child)]:border-l-0
    [&>[data-slot=toggle-group-item]:not(:last-child)]:rounded-r-none
  `,
  {
    variants: {
      variant: {
        default: "",
        outline: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type ToggleGroupVariants = VariantProps<typeof toggleGroupVariants>;

export interface ToggleGroupContext {
  size: ComputedRef<"default" | "sm" | "lg" | null | undefined>;
  variant: ComputedRef<ToggleGroupVariants["variant"]>;
}

export const toggleGroupContext = Symbol("toggle-group-context") as InjectionKey<ToggleGroupContext>;
