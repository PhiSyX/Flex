// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { CSSHoudiniUnitValue } from "@phisyx/flex-css/houdini/unit";

import { to_px } from "@phisyx/flex-css/houdini/unit";
import { minmax } from "@phisyx/flex-helpers/minmax";
import { Option } from "@phisyx/flex-safety/option";

// ---- //
// Type //
// ---- //

export interface Layer<D = unknown> {
	id: string;
	centered?: boolean;
	data?: D;
	destroyable?: "background" | "manual";
	background_color?: boolean;
	event?: Event & { clientX?: number; clientY?: number };
	dom_element?: HTMLElement;
	style?: {
		[key: string]: CSSHoudiniUnitValue;
	};
	on_close?: () => void;
	mouse_position?: Partial<{
		top: CSSHoudiniUnitValue;
		right?: CSSHoudiniUnitValue;
		bottom?: CSSHoudiniUnitValue;
		left: CSSHoudiniUnitValue;
	}>;
	trap_focus?: boolean;
}

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

export class OverlayerData {
	// --------- //
	// Propriété //
	// --------- //

	public layers: Map<string, Layer> = new Map();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get has_layers(): boolean {
		return this.layers.size > 0;
	}
}

export class OverlayerStore {
	// ------ //
	// Static //
	// ------ //

	static readonly NAME = "overlayer-store";

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(protected data: OverlayerData) {}

	// --------- //
	// Propriété //
	// --------- //

	$overlayer!: HTMLDivElement;
	$teleport!: HTMLDivElement;

	// ------- //
	// Méthode //
	// ------- //

	create<D = unknown>(payload: Layer<D>): Layer<D> {
		payload.destroyable ||= "background";
		payload.trap_focus ??= true;

		let dom_element = (payload.dom_element ||
			payload.event?.currentTarget) as HTMLElement | undefined;

		if (!dom_element) {
			this.data.layers.set(payload.id, { ...payload });
			return this.data.layers.get(payload.id) as Layer<D>;
		}

		if (
			dom_element.classList.contains(LAYER_HL_CSS_CLASS) ||
			dom_element.classList.contains(LAYER_HL_CSS_CLASS_ALT)
		) {
			return this.data.layers.get(payload.id) as Layer<D>;
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
			width: to_px(
				dom_position_element.width + MOUSE_POSITION_PADDING * 2,
			),
			height: to_px(
				dom_position_element.height + MOUSE_POSITION_PADDING * 2,
			),
		};

		let mouse_position: Layer["mouse_position"] = {};

		if (!payload.centered && payload.event) {
			let { clientX: deltaX = 0, clientY: deltaY = 0 } = payload.event;
			mouse_position.top = to_px(deltaY + MOUSE_POSITION_PADDING);
			mouse_position.left = to_px(deltaX + MOUSE_POSITION_PADDING);
		}

		this.data.layers.set(payload.id, {
			...payload,
			dom_element: dom_element,
			style,
			mouse_position,
		});

		return this.data.layers.get(payload.id) as Layer<D>;
	}

	destroy(layer_id: Layer["id"]) {
		let layer = this.data.layers.get(layer_id);

		if (!layer) {
			return;
		}

		layer.dom_element?.classList?.remove(LAYER_HL_CSS_CLASS);
		layer.dom_element?.classList?.remove(LAYER_HL_CSS_CLASS_ALT);
		layer.dom_element?.focus();

		layer.on_close?.call(this);

		this.data.layers.delete(layer_id);
	}

	destroy_all(options: { force: boolean } = { force: false }) {
		for (let [id, layer] of this.data.layers) {
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

	get(layer_id: Layer["id"]) {
		return Option.from(this.data.layers.get(layer_id));
	}

	get_unchecked(layer_id: Layer["id"]) {
		return this.data.layers.get(layer_id);
	}

	has(layer_id: Layer["id"]) {
		return this.data.layers.has(layer_id);
	}

	update(layer_id: Layer["id"]) {
		let layer = this.data.layers.get(layer_id);

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
			width: to_px(
				dom_position_element.width + MOUSE_POSITION_PADDING * 2,
			),
			height: to_px(
				dom_position_element.height + MOUSE_POSITION_PADDING * 2,
			),
		};

		let mouse_position: Layer["mouse_position"] =
			layer.mouse_position || {};

		if (
			!layer.centered &&
			layer.dom_element &&
			this.$overlayer &&
			this.$teleport
		) {
			let overlayer_rect = this.$overlayer.getBoundingClientRect();
			let dom_element_rect = layer.dom_element.getBoundingClientRect();
			let teleport_rect = this.$teleport.getBoundingClientRect();

			let val_top = dom_element_rect.top - MOUSE_POSITION_PADDING * 2;
			let min_top = overlayer_rect.top + MOUSE_POSITION_PADDING * 2;
			let max_top =
				overlayer_rect.height -
				teleport_rect.height -
				MOUSE_POSITION_PADDING * 2;

			let val_left = dom_element_rect.left - MOUSE_POSITION_PADDING * 2;
			let min_left = overlayer_rect.left + MOUSE_POSITION_PADDING * 2;
			let max_left =
				overlayer_rect.width -
				teleport_rect.width -
				MOUSE_POSITION_PADDING * 2;

			let top = minmax(val_top, min_top, max_top);
			let left = minmax(val_left, min_left, max_left);

			mouse_position.top = to_px(top);
			mouse_position.left = to_px(left);
		}

		this.data.layers.set(layer_id, { ...layer, style, mouse_position });
	}

	update_data<D = unknown>(layer_id: Layer<D>["id"], data: D) {
		let layer = this.data.layers.get(layer_id);
		if (!layer) {
			return;
		}
		layer.data = data;
	}

	update_all() {
		for (let [id, _] of this.data.layers) {
			this.update(id);
		}
	}
}
