import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NestedForms } from "./nested-forms";

afterEach(() => {
	cleanup();
});

describe("a Form nested in another Form (in the React tree)", () => {
	it("does not call the outer form's onSubmit when the inner form is submitted", async () => {
		const onOuterSubmit = vi.fn();
		const onInnerSubmit = vi.fn();
		render(<NestedForms onInnerSubmit={onInnerSubmit} onOuterSubmit={onOuterSubmit} />);

		await userEvent.click(screen.getByRole("button", { name: "Save inner" }));

		expect(onInnerSubmit).toHaveBeenCalledOnce();
		// Fails: the outer handler is chained into the inner form's onSubmit (and runs first), so it
		// is called for the inner form element.
		expect(onOuterSubmit).not.toHaveBeenCalled();
	});

	it("does not inherit the outer form's id and className", () => {
		render(<NestedForms onInnerSubmit={vi.fn()} onOuterSubmit={vi.fn()} />);

		const innerForm = screen.getByRole("form", { name: "Inner form" });

		// Fails: the inner form gets `id="outer-form"` (a duplicate id) and the outer class name.
		expect(innerForm.getAttribute("id")).not.toBe("outer-form");
		expect(innerForm.className).not.toContain("outer-form");
	});

	it("does not show the outer form's validation errors on the inner form's fields", () => {
		render(
			<NestedForms
				onInnerSubmit={vi.fn()}
				onOuterSubmit={vi.fn()}
				outerValidationErrors={{ name: "Outer: this name is taken." }}
			/>,
		);

		const outerForm = screen.getByRole("form", { name: "Outer form" });
		const innerForm = screen.getByRole("form", { name: "Inner form" });

		expect(within(outerForm).getByText("Outer: this name is taken.")).toBeDefined();
		// Fails: the inner form leaves `validationErrors` undefined, so it inherits the outer ones.
		expect(within(innerForm).queryByText("Outer: this name is taken.")).toBeNull();
	});
});
