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
	dom_element?: HTMLElement;
	style?: {
		[key: string]: CSSHoudiniUnitValue;
	};
	on_close?: () => void;
	mouse_position?: Partial<{
		top: CSSHoudiniUnitValue;
		left: CSSHoudiniUnitValue;
	}>;
	trap_focus?: boolean;
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

export class OverlayerStore
{
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

	get has_layers(): boolean
	{
		return this.layers.size > 0;
	}

	// ------- //
	// Méthode //
	// ------- //

	create<D = unknown>(payload: Layer<D>): Layer<D>
	{
		payload.destroyable ||= "background";
		payload.trap_focus ??= true;

		if (!payload.event) {
			this.layers.set(payload.id, payload);
			return this.layers.get(payload.id) as Layer<D>;
		}

		let dom_element = payload.dom_element || (payload.event.currentTarget as HTMLElement);

		if (
			dom_element.classList.contains(LAYER_HL_CSS_CLASS) ||
			dom_element.classList.contains(LAYER_HL_CSS_CLASS_ALT)
		) {
			return this.layers.get(payload.id) as Layer<D>;
		}

		let computed_style = window.getComputedStyle(dom_element);
		let css_position_element = computed_style.position;

		let layer_css_classes = LAYER_HL_CSS_CLASS;

		if (["absolute", "fixed"].includes(css_position_element)) {
			layer_css_classes = LAYER_HL_CSS_CLASS_ALT;
		}

		// nextTick(() =>
		dom_element.classList.add(layer_css_classes);
		// );

		let dom_position_element = dom_element.getBoundingClientRect();
		let style: Layer["style"] = {
			top: to_px(dom_position_element.top - MOUSE_POSITION_PADDING),
			right: to_px(dom_position_element.right + MOUSE_POSITION_PADDING),
			bottom: to_px(dom_position_element.bottom - MOUSE_POSITION_PADDING),
			left: to_px(dom_position_element.left - MOUSE_POSITION_PADDING),
			width: to_px(dom_position_element.width + MOUSE_POSITION_PADDING * 2),
			height: to_px(
				dom_position_element.height + MOUSE_POSITION_PADDING * 2,
			),
		};

		let mouse_position: Layer["mouse_position"] = {};

		if (!payload.centered) {
			let { clientX: deltaX = 0, clientY: deltaY = 0 } = payload.event;
			mouse_position.top = to_px(deltaY + MOUSE_POSITION_PADDING);
			mouse_position.left = to_px(deltaX + MOUSE_POSITION_PADDING);
		}

		this.layers.set(payload.id, {
			...payload,
			dom_element: dom_element,
			style,
			mouse_position,
		});

		return this.layers.get(payload.id) as Layer<D>;
	}

	destroy(layer_id: Layer["id"])
	{
		let layer = this.layers.get(layer_id);

		if (!layer) {
			return;
		}

		layer.dom_element?.classList?.remove(LAYER_HL_CSS_CLASS);
		layer.dom_element?.classList?.remove(LAYER_HL_CSS_CLASS_ALT);
		layer.dom_element?.focus();

		layer.on_close?.call(this);

		this.layers.delete(layer_id);
	}

	destroy_all(options: { force: boolean } = { force: false })
	{
		for (let [id, layer] of this.layers) {
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

	get(layer_id: Layer["id"])
	{
		return this.layers.get(layer_id);
	}

	has(layer_id: Layer["id"])
	{
		return this.layers.has(layer_id);
	}

	update(layer_id: Layer["id"])
	{
		let layer = this.layers.get(layer_id);

		if (!layer) {
			return;
		}

		let dom_position_element = layer.dom_element?.getBoundingClientRect();
		if (!dom_position_element) {
			return;
		}

		let style: Layer["style"] = {
			top: to_px(dom_position_element.top - MOUSE_POSITION_PADDING),
			right: to_px(dom_position_element.right + MOUSE_POSITION_PADDING),
			bottom: to_px(dom_position_element.bottom - MOUSE_POSITION_PADDING),
			left: to_px(dom_position_element.left - MOUSE_POSITION_PADDING),
			width: to_px(dom_position_element.width + MOUSE_POSITION_PADDING * 2),
			height: to_px(
				dom_position_element.height + MOUSE_POSITION_PADDING * 2,
			),
		};

		this.layers.set(layer_id, { ...layer, style });
	}

	update_data<D = unknown>(layer_id: Layer<D>["id"], data: D)
	{
		let layer = this.layers.get(layer_id);
		if (!layer) {
			return;
		}
		layer.data = data;
	}

	update_all()
	{
		for (let [id, _] of this.layers) {
			this.update(id);
		}
	}
}
