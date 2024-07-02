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
