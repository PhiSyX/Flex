import type { Signal } from "@phisyx/flex-signal";
import { HTMLElementExtension } from "./html";

// ---- //
// Type //
// ---- //

type FormAction = `/${string}` | `http://${string}` | `https://${string}`;
type FormMethod = "get" | "post" | "dialog";

// -------------- //
// Implémentation //
// -------------- //

export class FormHTMLElementExtension extends HTMLElementExtension<HTMLFormElement> {
	static make(args: HTMLElementExtension.Args): FormHTMLElementExtension {
		return new FormHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args) {
		super(document.createElement("form"), args);
	}

	/**
	 * Public API
	 */

	action(uri: FormAction): this {
		this.setAttribute("action", uri);
		return this;
	}

	method<Verb extends FormMethod>(httpVerb: Uppercase<Verb>): this;
	method<Verb extends FormMethod>(httpVerb: Lowercase<Verb>): this;
	method(httpVerb: string): this {
		this.setAttribute("method", httpVerb);
		return this;
	}

	onSubmit(fn: (evt: SubmitEvent) => void): this {
		return this.on("submit", fn);
	}

	submitWith(params: {
		success?: (evt: SubmitEvent, res: Response) => void;
		failure?: (evt: SubmitEvent, err: unknown) => void;
		xhrOptions?: Omit<RequestInit, "method" | "body">;
	}): this {
		return this.onSubmit(function (this: HTMLFormElement, evt) {
			let body: BodyInit | undefined = undefined;

			if (this.method.toUpperCase() === "POST") {
				body = new FormData(this);
			}

			evt.preventDefault();

			fetch(this.action, {
				...params.xhrOptions,
				method: this.method,
				body,
			})
				.then((res) => params.success?.(evt, res))
				.catch((err) => params.failure?.(evt, err));
		});
	}
}

export class InputHTMLElementExtension extends HTMLElementExtension<HTMLInputElement> {
	static make(args: HTMLElementExtension.Args): InputHTMLElementExtension {
		return new InputHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args) {
		super(document.createElement("input"), args);
	}

	/**
	 * Public API
	 */

	form(id?: string): this {
		this.setAttribute("form", id);
		return this;
	}

	model<M extends HTMLElementExtension.Primitives>(signal: Signal<M>): this {
		signal.watch((model) => this.handleSignal(model), { immediate: true });

		this.on("input", (evt) => {
			// @ts-expect-error - We know that the input event is only triggered
			// on form elements, and that they have the property (`value` in
			// `EventTarget`) in their object.
			signal.set(evt.target.value);
		});

		return this;
	}

	name(user: string): this {
		this.setAttribute("name", user);
		return this;
	}

	value(userValue: unknown): this {
		this.setAttribute("value", String(userValue));
		return this;
	}
}

export class LabelHTMLElementExtension extends HTMLElementExtension<HTMLLabelElement> {
	static make(args: HTMLElementExtension.Args): LabelHTMLElementExtension {
		return new LabelHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args) {
		super(document.createElement("label"), args);
	}

	/**
	 * Public API
	 */

	for(id: `#${string}`): this {
		this.setAttribute("for", id.slice(1));
		return this;
	}
}
