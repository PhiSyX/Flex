// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, type Option } from "@phisyx/flex-safety";
import type { Layer, OverlayerStore } from "~/storage/memory/overlayer";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelTopicLayer {
	// ------ //
	// Static //
	// ------ //

	static ID = "channel-topic-layer";

	static create(
		overlayerStore: OverlayerStore,
		payload: {
			event: Event;
			linkedElement: HTMLElement | undefined;
		},
	) {
		overlayerStore.create({
			id: ChannelTopicLayer.ID,
			destroyable: "manual",
			event: payload.event,
			DOMElement: payload.linkedElement,
			trapFocus: false,
		});

		return new ChannelTopicLayer(overlayerStore);
	}

	static destroy(overlayerStore: OverlayerStore) {
		overlayerStore.destroy(ChannelTopicLayer.ID);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayerStore: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayerStore.destroy(ChannelTopicLayer.ID);
	}

	get(): Layer | undefined {
		return this.overlayerStore.get(ChannelTopicLayer.ID);
	}

	exists(): boolean {
		return this.overlayerStore.has(ChannelTopicLayer.ID);
	}
}

export class ChannelTopic {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Sujet du salon.
	 */
	private text: Option<string> = None();

	/**
	 * État d'édition.
	 */
	private editable = true;

	/**
	 * Historique des sujets (en session)
	 */
	public history: Set<string> = new Set();

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Est-ce que le sujet du salon est éditable.
	 */
	isEditable(): boolean {
		return this.editable;
	}

	/**
	 * Sujet du salon.
	 */
	get(): string {
		return this.text.unwrap_or("");
	}

	/**
	 * Définit le sujet du salon.
	 */
	set(topic: string, options?: { force: boolean }) {
		if (this.editable || options?.force) {
			this.history.delete(topic);
			this.history.add(topic);
			this.text.replace(topic);
		}
	}

	/**
	 * Définit l'état d'édition.
	 */
	setEditable(b: boolean) {
		this.editable = b;
	}

	/**
	 * Définit le sujet du salon à du vide.
	 */
	unset(options?: { force: boolean }) {
		if (this.editable || options?.force) {
			this.text = None();
		}
	}
}
