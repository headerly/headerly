export interface Option {
  value: string;
  label: string;
  tagLabel?: string;
  icon?: string;
  fallbackIcon?: string;
  tooltip?: string;
  tooltipClass?: string;
  disabled?: boolean;
  fixed?: boolean;
  [key: string]: string | boolean | undefined;
}

export { default as MultiSelect } from "./MultiSelect.vue";
