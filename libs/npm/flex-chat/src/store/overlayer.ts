// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { type CSSHoudiniUnitValue, to_px } from "@phisyx/flex-css";

// ---- //
// Type //
// ---- //

export type Layer<D = unknown> = {
	id: string;
	centered?: boolean;
	data?: D;
	destroyable?: "background" | "manual";
	event?: Event & { clientX?: number; clientY?: number };
	DOMElement?: HTMLElement;
	style?: {
		[key: string]: CSSHoudiniUnitValue;
	};
	onClose?: () => void;
	mousePosition?: Partial<{
		top: CSSHoudiniUnitValue;
		left: CSSHoudiniUnitValue;
	}>;
	trapFocus?: boolean;
};

// -------- //
// Constant //
// -------- //

/// Classe CSS de mise en évidence d'un élément du DOM.
const LAYER_HL_CSS_CLASS = "layer@highlight";
/// Classe CSS de mise en évidence d'un élément du DOM ayant une position CSS
/// différente de `relative`.
const LAYER_HL_CSS_CLASS_ALT = "layer@highlight--alt";

const MOUSE_POSITION_PADDING: number = 4;

// -------------- //
// Implémentation //
// -------------- //

export class OverlayerStore {
	// ------ //
	// Static //
	// ------ //

	static ID = "overlayer-store";

	// --------- //
	// Propriété //
	// --------- //

	layers: Map<string, Layer> = new Map();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get hasLayers(): boolean {
		return this.layers.size > 0;
	}

	// ------- //
	// Méthode //
	// ------- //

	create<D = unknown>(payload: Layer<D>): Layer<D> {
		payload.destroyable ||= "background";
		payload.trapFocus ??= true;

		if (!payload.event) {
			this.layers.set(payload.id, payload);
			return this.layers.get(payload.id) as Layer<D>;
		}

		const DOMElement =
			payload.DOMElement || (payload.event.currentTarget as HTMLElement);

		if (
			DOMElement.classList.contains(LAYER_HL_CSS_CLASS) ||
			DOMElement.classList.contains(LAYER_HL_CSS_CLASS_ALT)
		) {
			return this.layers.get(payload.id) as Layer<D>;
		}

		const computedStyle = window.getComputedStyle(DOMElement);
		const CSSPositionElement = computedStyle.position;

		let layerCssClasses = LAYER_HL_CSS_CLASS;

		if (["absolute", "fixed"].includes(CSSPositionElement)) {
			layerCssClasses = LAYER_HL_CSS_CLASS_ALT;
		}

		// nextTick(() =>
		DOMElement.classList.add(layerCssClasses);
		// );

		const DOMPositionElement = DOMElement.getBoundingClientRect();
		const style: Layer["style"] = {
			top: to_px(DOMPositionElement.top - MOUSE_POSITION_PADDING),
			right: to_px(DOMPositionElement.right + MOUSE_POSITION_PADDING),
			bottom: to_px(DOMPositionElement.bottom - MOUSE_POSITION_PADDING),
			left: to_px(DOMPositionElement.left - MOUSE_POSITION_PADDING),
			width: to_px(DOMPositionElement.width + MOUSE_POSITION_PADDING * 2),
			height: to_px(
				DOMPositionElement.height + MOUSE_POSITION_PADDING * 2,
			),
		};

		const mousePosition: Layer["mousePosition"] = {};
		if (!payload.centered) {
			const { clientX: deltaX = 0, clientY: deltaY = 0 } = payload.event;
			mousePosition.top = to_px(deltaY + MOUSE_POSITION_PADDING);
			mousePosition.left = to_px(deltaX + MOUSE_POSITION_PADDING);
		}

		this.layers.set(payload.id, {
			...payload,
			DOMElement,
			style,
			mousePosition,
		});

		return this.layers.get(payload.id) as Layer<D>;
	}

	destroy(layerID: Layer["id"]) {
		const layer = this.layers.get(layerID);
		if (!layer) return;

		layer.DOMElement?.classList?.remove(LAYER_HL_CSS_CLASS);
		layer.DOMElement?.classList?.remove(LAYER_HL_CSS_CLASS_ALT);
		layer.DOMElement?.focus();

		layer.onClose?.call(this);

		this.layers.delete(layerID);
	}

	destroyAll(options: { force: boolean } = { force: false }) {
		for (const [id, layer] of this.layers) {
			if (options.force) {
				this.destroy(id);
				continue;
			}

			if (layer.destroyable !== "background") {
				continue;
			}

			this.destroy(id);
		}
	}

	get(layerID: Layer["id"]) {
		return this.layers.get(layerID);
	}

	has(layerID: Layer["id"]) {
		return this.layers.has(layerID);
	}

	update(layerID: Layer["id"]) {
		const layer = this.layers.get(layerID);

		if (!layer) return;

		const DOMPositionElement = layer.DOMElement?.getBoundingClientRect();
		if (!DOMPositionElement) return;

		const style: Layer["style"] = {
			top: to_px(DOMPositionElement.top - MOUSE_POSITION_PADDING),
			right: to_px(DOMPositionElement.right + MOUSE_POSITION_PADDING),
			bottom: to_px(DOMPositionElement.bottom - MOUSE_POSITION_PADDING),
			left: to_px(DOMPositionElement.left - MOUSE_POSITION_PADDING),
			width: to_px(DOMPositionElement.width + MOUSE_POSITION_PADDING * 2),
			height: to_px(
				DOMPositionElement.height + MOUSE_POSITION_PADDING * 2,
			),
		};

		this.layers.set(layerID, { ...layer, style });
	}

	updateData<D = unknown>(layerID: Layer<D>["id"], data: D) {
		const layer = this.layers.get(layerID);
		if (!layer) return;
		layer.data = data;
	}

	updateAll() {
		for (const [id, _] of this.layers) {
			this.update(id);
		}
	}
}
