import "modern-monaco/editor-core";

declare module "modern-monaco/editor-core" {
  export const cssBundle: string;
  export function createEditorWorkerMain(): Worker;
}
