// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Layer, OverlayerStore } from "@phisyx/flex-chat";

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
