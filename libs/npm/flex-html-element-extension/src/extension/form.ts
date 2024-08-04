// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

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

export class FormHTMLElementExtension extends HTMLElementExtension<HTMLFormElement>
{
	static make(args: HTMLElementExtension.Args): FormHTMLElementExtension
	{
		return new FormHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args)
	{
		super(document.createElement("form"), args);
	}

	/**
	 * Public API
	 */

	action(uri: FormAction): this
	{
		this.set_attribute("action", uri);
		return this;
	}

	method<Verb extends FormMethod>(http_verb: Uppercase<Verb>): this;
	method<Verb extends FormMethod>(http_verb: Lowercase<Verb>): this;
	method(http_verb: string): this
	{
		this.set_attribute("method", http_verb);
		return this;
	}

	on_submit(fn: (evt: SubmitEvent) => void): this
	{
		return this.on("submit", fn);
	}

	submit_with(params: {
		success?: (evt: SubmitEvent, res: Response) => void;
		failure?: (evt: SubmitEvent, err: unknown) => void;
		xhr_options?: Omit<RequestInit, "method" | "body">;
	}): this
	{
		return this.on_submit(function (this: HTMLFormElement, evt) {
			let body: BodyInit | undefined = undefined;

			if (this.method.toUpperCase() === "POST") {
				body = new FormData(this);
			}

			evt.preventDefault();

			fetch(this.action, {
				...params.xhr_options,
				method: this.method,
				body,
			})
				.then((res) => params.success?.(evt, res))
				.catch((err) => params.failure?.(evt, err));
		});
	}
}

export class InputHTMLElementExtension extends HTMLElementExtension<HTMLInputElement>
{
	static make(args: HTMLElementExtension.Args): InputHTMLElementExtension
	{
		return new InputHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args)
	{
		super(document.createElement("input"), args);
	}

	/**
	 * Public API
	 */

	form(id?: string): this
	{
		this.set_attribute("form", id);
		return this;
	}

	model<M extends HTMLElementExtension.Primitives>(signal: Signal<M>): this
	{
		signal.watch((model) => this.handle_signal(model), { immediate: true });

		this.on("input", (evt) => {
			// @ts-expect-error - We know that the input event is only triggered
			// on form elements, and that they have the property (`value` in
			// `EventTarget`) in their object.
			signal.set(evt.target.value);
		});

		return this;
	}

	name(user: string): this
	{
		this.set_attribute("name", user);
		return this;
	}

	value(userValue: unknown): this
	{
		this.set_attribute("value", String(userValue));
		return this;
	}
}

export class LabelHTMLElementExtension extends HTMLElementExtension<HTMLLabelElement>
{
	static make(args: HTMLElementExtension.Args): LabelHTMLElementExtension
	{
		return new LabelHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args)
	{
		super(document.createElement("label"), args);
	}

	/**
	 * Public API
	 */

	for(id: `#${string}`): this
	{
		this.set_attribute("for", id.slice(1));
		return this;
	}
}
