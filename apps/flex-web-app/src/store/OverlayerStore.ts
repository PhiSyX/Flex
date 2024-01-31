// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { to_px } from "@phisyx/flex-css";
import { defineStore } from "pinia";
import { CSSProperties, computed, nextTick, reactive, ref } from "vue";

// ---- //
// Type //
// ---- //

export type Layer = {
	id: string;
	centered?: boolean;
	destroyable?: "background" | "manual";
	event?: Event & { clientX: number; clientY: number };
	DOMElement?: Element;
	style?: CSSProperties;
	onClose?: () => void;
	mousePosition?: Partial<{ top: CSSUnitValue; left: CSSUnitValue }>;
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

export const useOverlayerStore = defineStore("overlayer-store", () => {
	const layers = reactive(new Map<string, Layer>());

	const hasLayers = computed(() => layers.size > 0);

	function create(payload: Layer) {
		payload.destroyable ||= "background";

		if (!payload.event) {
			layers.set(payload.id, payload);
			return;
		}

		const DOMElement = payload.event.currentTarget as Element;

		if (
			DOMElement.classList.contains(LAYER_HL_CSS_CLASS) ||
			DOMElement.classList.contains(LAYER_HL_CSS_CLASS_ALT)
		) {
			return;
		}

		const computedStyle = window.getComputedStyle(DOMElement);
		const CSSPositionElement = computedStyle.position;

		let layerCssClasses = LAYER_HL_CSS_CLASS;

		if (["absolute", "fixed"].includes(CSSPositionElement)) {
			layerCssClasses = LAYER_HL_CSS_CLASS_ALT;
		}

		nextTick(() => DOMElement.classList.add(layerCssClasses));

		const DOMPositionElement = DOMElement.getBoundingClientRect();
		const style: Layer["style"] = {
			top: to_px(DOMPositionElement.top - MOUSE_POSITION_PADDING),
			right: to_px(DOMPositionElement.right + MOUSE_POSITION_PADDING),
			bottom: to_px(DOMPositionElement.bottom - MOUSE_POSITION_PADDING),
			left: to_px(DOMPositionElement.left - MOUSE_POSITION_PADDING),
			width: to_px(DOMPositionElement.width + MOUSE_POSITION_PADDING * 2),
			height: to_px(DOMPositionElement.height + MOUSE_POSITION_PADDING * 2),
		};

		const mousePosition: Layer["mousePosition"] = {};
		if (!payload.centered) {
			const { clientX: deltaX, clientY: deltaY } = payload.event;
			mousePosition.top = to_px(deltaY + MOUSE_POSITION_PADDING);
			mousePosition.left = to_px(deltaX + MOUSE_POSITION_PADDING);
		}

		layers.set(payload.id, {
			...payload,
			DOMElement,
			style,
			mousePosition,
		});
	}

	function destroy(layerID: Layer["id"]) {
		const layer = layers.get(layerID);
		if (!layer) return;

		layer.DOMElement?.classList?.remove(LAYER_HL_CSS_CLASS);
		layer.DOMElement?.classList?.remove(LAYER_HL_CSS_CLASS_ALT);

		layer.onClose?.call(layers);

		layers.delete(layerID);
	}

	function destroyAll(options: { force: boolean } = { force: false }) {
		for (const [id, layer] of layers) {
			if (options.force) {
				destroy(id);
				continue;
			}

			if (layer.destroyable !== "background") {
				continue;
			}

			destroy(id);
		}
	}

	function update(layerID: Layer["id"]) {
		const layer = layers.get(layerID);

		if (!layer) return;

		const DOMPositionElement = layer.DOMElement?.getBoundingClientRect();
		if (!DOMPositionElement) return;

		const style: Layer["style"] = {
			top: to_px(DOMPositionElement.top - MOUSE_POSITION_PADDING),
			right: to_px(DOMPositionElement.right + MOUSE_POSITION_PADDING),
			bottom: to_px(DOMPositionElement.bottom - MOUSE_POSITION_PADDING),
			left: to_px(DOMPositionElement.left - MOUSE_POSITION_PADDING),
			width: to_px(DOMPositionElement.width + MOUSE_POSITION_PADDING * 2),
			height: to_px(DOMPositionElement.height + MOUSE_POSITION_PADDING * 2),
		};

		layers.set(layerID, { ...layer, style });
	}

	function updateAll() {
		for (const [id, _] of layers) {
			update(id);
		}
	}

	return {
		create,
		destroy,
		destroyAll,
		hasLayers,
		layers,
		updateAll,
	};
});
