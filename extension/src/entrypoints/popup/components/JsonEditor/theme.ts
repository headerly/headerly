import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

function createTheme(dark: boolean) {
  return [
    EditorView.theme({
      "&": {
        "color": "var(--foreground)",
        "backgroundColor": "var(--background)",
        // Syntax colors are local to the editor; surfaces follow the app palette.
        "--editor-key": dark ? "#93c5fd" : "#1d4ed8",
        "--editor-string": dark ? "#86efac" : "#166534",
        "--editor-number": dark ? "#fdba74" : "#9a3412",
        "--editor-literal": dark ? "#d8b4fe" : "#7e22ce",
        "--editor-selection": "color-mix(in oklch, var(--brand) 22%, var(--background))",
        "--editor-match": "color-mix(in oklch, var(--brand) 14%, var(--background))",
      },
      "&.cm-focused": { outline: "none" },
      ".cm-content": { caretColor: "var(--foreground)" },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--foreground)" },
      ".cm-gutters": {
        backgroundColor: "var(--muted)",
        color: "var(--muted-foreground)",
        borderRight: "1px solid var(--border)",
      },
      ".cm-activeLine": { backgroundColor: "var(--muted)" },
      ".cm-activeLineGutter": {
        backgroundColor: "var(--editor-selection)",
        color: "var(--foreground)",
      },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: "var(--editor-selection)",
      },
      ".cm-selectionMatch": { backgroundColor: "var(--editor-match)" },
      ".cm-searchMatch": {
        backgroundColor: "var(--editor-match)",
        outline: "1px solid var(--brand)",
      },
      ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "var(--editor-selection)" },
      "&.cm-focused .cm-matchingBracket": {
        backgroundColor: "var(--editor-selection)",
        outline: "1px solid var(--ring)",
      },
      "&.cm-focused .cm-nonmatchingBracket": { color: "var(--destructive)" },
      ".cm-foldPlaceholder": {
        backgroundColor: "var(--muted)",
        color: "var(--muted-foreground)",
        border: "1px solid var(--border)",
      },
      ".cm-panels, .cm-tooltip": {
        backgroundColor: "var(--popover)",
        color: "var(--popover-foreground)",
        borderColor: "var(--border)",
      },
      ".cm-tooltip": { border: "1px solid var(--border)", borderRadius: "6px" },
      ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
        backgroundColor: "var(--accent)",
        color: "var(--accent-foreground)",
      },
      ".cm-completionMatchedText": { color: "var(--editor-key)", textDecoration: "none" },
      ".cm-diagnostic-error": { borderLeftColor: "var(--destructive)" },
      ".cm-diagnostic-warning": { borderLeftColor: "var(--editor-number)" },
      ".cm-lintRange-error": { textDecoration: "underline wavy var(--destructive)", backgroundImage: "none" },
      ".cm-lintRange-warning": { textDecoration: "underline wavy var(--editor-number)", backgroundImage: "none" },
      ".cm-lintRange-active": { backgroundColor: "var(--editor-match)" },
    }, { dark }),
    syntaxHighlighting(HighlightStyle.define([
      { tag: tags.propertyName, color: "var(--editor-key)" },
      { tag: tags.string, color: "var(--editor-string)" },
      { tag: tags.number, color: "var(--editor-number)" },
      { tag: [tags.bool, tags.null, tags.keyword], color: "var(--editor-literal)" },
      { tag: [tags.punctuation, tags.separator], color: "var(--muted-foreground)" },
      { tag: tags.comment, color: "var(--muted-foreground)", fontStyle: "italic" },
      { tag: tags.invalid, color: "var(--destructive)" },
    ])),
  ];
}

export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);
