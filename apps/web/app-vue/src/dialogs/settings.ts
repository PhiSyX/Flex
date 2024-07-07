// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Layer, OverlayerStore } from "~/storage/memory/overlayer";

import type { ChannelMember, ChannelRoom } from "@phisyx/flex-chat";

// ---- //
// Type //
// ---- //

export interface ChannelSettingsRecordDialog {
	// Salon actif
	room: ChannelRoom;
	// Le client courant, qui est membre du salon.
	currentClientChannelMember: ChannelMember;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChannelSettingsDialog {
	// ------ //
	// Static //
	// ------ //

	static ID = "channel-settings-layer";

	static create(
		overlayerStore: OverlayerStore,
		data: ChannelSettingsRecordDialog,
	) {
		overlayerStore.create({
			id: ChannelSettingsDialog.ID,
			destroyable: "manual",
			centered: true,
			data,
		});

		return new ChannelSettingsDialog(overlayerStore);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayerStore: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayerStore.destroy(ChannelSettingsDialog.ID);
	}

	get(): Layer<ChannelSettingsRecordDialog> | undefined {
		return this.overlayerStore.get(ChannelSettingsDialog.ID) as
			| Layer<ChannelSettingsRecordDialog>
			| undefined;
	}

	getUnchecked(): Layer<ChannelSettingsRecordDialog> {
		return this.overlayerStore.get(
			ChannelSettingsDialog.ID,
		) as Layer<ChannelSettingsRecordDialog>;
	}

	exists(): boolean {
		return this.overlayerStore.has(ChannelSettingsDialog.ID);
	}

	withData(data: ChannelSettingsRecordDialog) {
		this.overlayerStore.updateData(ChannelSettingsDialog.ID, data);
	}
}
