import { HTMLElementExtension } from "./html";

// ---- //
// Type //
// ---- //

type ButtonType = HTMLButtonElement["type"] | "dialog";

// -------------- //
// Implémentation //
// -------------- //

export class ButtonHTMLElementExtension extends HTMLElementExtension<HTMLButtonElement> {
	static make(args: HTMLElementExtension.Args): ButtonHTMLElementExtension {
		return new ButtonHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args) {
		super(document.createElement("button"), args);
	}

	/**
	 * Public API
	 */

	override type(ty?: ButtonType & {}): this {
		return super.type(ty);
	}
}
