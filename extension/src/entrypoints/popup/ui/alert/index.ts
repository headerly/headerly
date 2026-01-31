import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Alert } from "./Alert.vue";
export { default as AlertDescription } from "./AlertDescription.vue";
export { default as AlertTitle } from "./AlertTitle.vue";

export const alertVariants = cva(
  `
    relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg
    border px-4 py-3 text-sm
    has-[>i]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>i]:gap-x-3
    [&>i]:size-4 [&>i]:translate-y-0.5 [&>i]:text-current
  `,
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        warning: `
          bg-card text-warning
          *:data-[slot=alert-description]:text-warning/90
        `,
        destructive: `
          bg-card text-destructive
          *:data-[slot=alert-description]:text-destructive/90
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;
