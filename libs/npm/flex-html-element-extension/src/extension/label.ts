import { HTMLElementExtension } from "./html";

// -------------- //
// Implémentation //
// -------------- //

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
