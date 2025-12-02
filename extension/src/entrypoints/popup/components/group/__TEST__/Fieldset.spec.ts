import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import Fieldset from "../Fieldset.vue";

describe("fieldset Component", () => {
  it("renders with required name prop", async () => {
    render(Fieldset, {
      props: {
        name: "Test Fieldset",
      },
    });

    const fieldset = page.getByTestId("fieldset");
    const legend = page.getByTestId("fieldset-legend");
    const nameElement = page.getByTestId("fieldset-name");

    await expect.element(fieldset).toBeVisible();
    await expect.element(legend).toBeVisible();
    await expect.element(nameElement).toHaveTextContent("Test Fieldset");
  });

  it("renders with all slots populated", async () => {
    render(Fieldset, {
      props: {
        name: "Complete Fieldset",
      },
      slots: {
        "name-before": "<span data-testid=\"icon\">🔧</span>",
        "name-after": "<span data-testid=\"badge\">2</span>",
        "main": `
          <div data-testid="complex-content">
            <input data-testid="input-field" type="text" placeholder="Enter text" />
            <div data-testid="button-group">
              <button data-testid="save-btn">Save</button>
              <button data-testid="cancel-btn">Cancel</button>
            </div>
          </div>
        `,
      },
    });

    // Check legend content order and visibility
    const icon = page.getByTestId("icon");
    const fieldsetName = page.getByTestId("fieldset-name");
    const badge = page.getByTestId("badge");

    await expect.element(icon).toBeVisible();
    await expect.element(icon).toHaveTextContent("🔧");
    await expect.element(fieldsetName).toHaveTextContent("Complete Fieldset");
    await expect.element(badge).toBeVisible();
    await expect.element(badge).toHaveTextContent("2");

    // Check main content
    const complexContent = page.getByTestId("complex-content");
    const inputField = page.getByTestId("input-field");
    const saveBtn = page.getByTestId("save-btn");
    const cancelBtn = page.getByTestId("cancel-btn");

    await expect.element(complexContent).toBeVisible();
    await expect.element(inputField).toBeVisible();
    await expect.element(saveBtn).toHaveTextContent("Save");
    await expect.element(cancelBtn).toHaveTextContent("Cancel");
  });
});
