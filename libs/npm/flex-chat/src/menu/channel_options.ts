// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";

import type { ChannelMember } from "../channel/member";
import type { ChannelRoom } from "../channel/room";
import type { Layer, OverlayerStore } from "../store";
import type { MenuInterface } from "./interface";

// ---- //
// Type //
// ---- //

export interface ChannelOptionsRecordMenu {
	// Salon actif
	room: ChannelRoom;
	// Le client courant, qui est membre du salon.
	currentClientChannelMember: Option<ChannelMember>;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChannelOptionsMenu
	implements MenuInterface<ChannelOptionsRecordMenu>
{
	// ------ //
	// Static //
	// ------ //

	static ID = "menu-channel-options-layer";

	static create(
		overlayer_store: OverlayerStore,
		event: Event,
		record: ChannelOptionsRecordMenu,
	) {
		overlayer_store.create({
			id: ChannelOptionsMenu.ID,
			background_color: true,
			event,
			data: record,
		});

		return new ChannelOptionsMenu(overlayer_store);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayer_store: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayer_store.destroy(ChannelOptionsMenu.ID);
	}

	get(): Option<Layer<ChannelOptionsRecordMenu>> {
		return this.overlayer_store
			.get(ChannelOptionsMenu.ID)
			.as<Layer<ChannelOptionsRecordMenu>>();
	}

	get_unchecked(): Layer<ChannelOptionsRecordMenu> {
		return this.get().unwrap_unchecked();
	}

	exists(): boolean {
		return this.overlayer_store.has(ChannelOptionsMenu.ID);
	}

	with_data(data: ChannelOptionsRecordMenu) {
		this.overlayer_store.update_data(ChannelOptionsMenu.ID, data);
	}
}
