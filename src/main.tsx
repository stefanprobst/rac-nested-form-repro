import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import { NestedForms } from "./nested-forms";

function App() {
	const [log, setLog] = useState<Array<string>>([]);
	const [withErrors, setWithErrors] = useState(false);

	return (
		<main>
			<h1>react-aria-components: nested Form inherits the outer Form's props</h1>
			<p>
				Submit the inner form ("Save inner"), then inspect both forms' <code>id</code> and{" "}
				<code>class</code>, and toggle the outer form's validation errors.
			</p>
			<label>
				<input
					checked={withErrors}
					onChange={(event) => {
						setWithErrors(event.target.checked);
					}}
					type="checkbox"
				/>{" "}
				Outer form has <code>validationErrors={"{{ name: … }}"}</code>
			</label>
			<NestedForms
				onInnerSubmit={() => {
					setLog((log) => [...log, "inner onSubmit"]);
				}}
				onOuterSubmit={(formName) => {
					setLog((log) => [...log, `outer onSubmit, called for: ${formName ?? "?"}`]);
				}}
				outerValidationErrors={withErrors ? { name: "Outer: this name is taken." } : undefined}
			/>
			<h2>Log</h2>
			<pre>{log.join("\n")}</pre>
		</main>
	);
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
