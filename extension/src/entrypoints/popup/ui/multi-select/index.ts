export interface Option<T extends string | number = string> {
  value: T;
  label: string;
  tagLabel?: string;
  icon?: string;
  fallbackIcon?: string;
  tooltip?: string;
  tooltipClass?: string;
  disabled?: boolean;
  fixed?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export { default as MultiSelect } from "./MultiSelect.vue";
