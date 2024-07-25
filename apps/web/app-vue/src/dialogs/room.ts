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

export class ChannelJoinDialog {
	// ------ //
	// Static //
	// ------ //

	static ID = "channel-join-layer";

	static create(
		overlayerStore: OverlayerStore,
		payload: {
			event: Event;
		},
	) {
		overlayerStore.create({
			id: ChannelJoinDialog.ID,
			centered: true,
			event: payload.event,
		});

		return new ChannelJoinDialog(overlayerStore);
	}

	static destroy(overlayerStore: OverlayerStore) {
		overlayerStore.destroy(ChannelJoinDialog.ID);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayerStore: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayerStore.destroy(ChannelJoinDialog.ID);
	}

	get(): Layer | undefined {
		return this.overlayerStore.get(ChannelJoinDialog.ID);
	}

	exists(): boolean {
		return this.overlayerStore.has(ChannelJoinDialog.ID);
	}
}
