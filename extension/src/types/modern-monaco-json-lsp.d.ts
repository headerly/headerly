declare module "modern-monaco/lsp/json/setup" {
  import type { LSPConfig } from "modern-monaco";
  import type * as Monaco from "modern-monaco/editor-core";

  export function setup(
    monaco: typeof Monaco,
    languageId: string,
    languageSettings?: LSPConfig["json"],
    formattingOptions?: LSPConfig["formatting"],
  ): Promise<void>;
}
