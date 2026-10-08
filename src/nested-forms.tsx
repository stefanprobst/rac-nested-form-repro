import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, FieldError, Form, Input, Label, TextField } from "react-aria-components";

export interface NestedFormsProps {
	outerValidationErrors?: Record<string, string>;
	/** Receives the accessible name of the form element the handler was called for. */
	onOuterSubmit: (formName: string | null) => void;
	onInnerSubmit: () => void;
}

/**
 * An outer form, and an independent inner form rendered into a portal (as a "create related item"
 * dialog would be). The inner form is nested in the outer one in the React tree only, the DOM has
 * no nested `<form>` elements.
 */
export function NestedForms(props: NestedFormsProps): ReactNode {
	const { outerValidationErrors, onOuterSubmit, onInnerSubmit } = props;

	return (
		<Form
			aria-label="Outer form"
			className="outer-form"
			id="outer-form"
			onSubmit={(event) => {
				// Ignore submit events of other forms which bubble up through the portal, which is
				// expected React behaviour and unrelated to this issue.
				if (event.target !== event.currentTarget) {
					return;
				}
				event.preventDefault();
				onOuterSubmit(event.currentTarget.getAttribute("aria-label"));
			}}
			validationErrors={outerValidationErrors}
		>
			<TextField name="name">
				<Label>Outer name</Label>
				<Input />
				<FieldError />
			</TextField>
			<Button type="submit">Save outer</Button>

			{createPortal(
				<Form
					aria-label="Inner form"
					onSubmit={(event) => {
						event.preventDefault();
						onInnerSubmit();
					}}
				>
					<TextField name="name">
						<Label>Inner name</Label>
						<Input />
						<FieldError />
					</TextField>
					<Button type="submit">Save inner</Button>
				</Form>,
				document.body,
			)}
		</Form>
	);
}
