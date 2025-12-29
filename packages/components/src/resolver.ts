import type { ComponentResolver } from "unplugin-vue-components/types";

// @keep-sorted
const components = [
  "Button",
];
const componentsSet = new Set(components);

export function ShadcnResolver() {
  return {
    type: "component",
    resolve: (name: string) => {
      const PREFIX = "V";
      if (!name.startsWith(PREFIX)) {
        return;
      }

      const componentName = name.substring(PREFIX.length);
      if (!componentsSet.has(componentName)) {
        return;
      }

      return {
        name: componentName,
        from: `@headerly/components`,
      };
    },
  } satisfies ComponentResolver;
}
