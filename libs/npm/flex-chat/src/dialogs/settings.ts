// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelMember } from "../channel/member";
import type { ChannelRoom } from "../channel/room";
import type { Layer, OverlayerStore } from "../store";

// ---- //
// Type //
// ---- //

export interface ChannelSettingsRecordDialog
{
	// Salon actif
	room: ChannelRoom;
	// Le client courant, qui est membre du salon.
	current_client_channel_member: ChannelMember;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChannelSettingsDialog
{
	// ------ //
	// Static //
	// ------ //

	static ID = "channel-settings-layer";

	static create(
		overlayer_store: OverlayerStore,
		data: ChannelSettingsRecordDialog,
	)
	{
		overlayer_store.create({
			id: ChannelSettingsDialog.ID,
			destroyable: "manual",
			centered: true,
			data,
		});

		return new ChannelSettingsDialog(overlayer_store);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayer_store: OverlayerStore)
	{}

	// ------- //
	// Méthode //
	// ------- //

	destroy()
	{
		this.overlayer_store.destroy(ChannelSettingsDialog.ID);
	}

	get(): Layer<ChannelSettingsRecordDialog> | undefined
	{
		return this.overlayer_store.get(ChannelSettingsDialog.ID) as
			| Layer<ChannelSettingsRecordDialog>
			| undefined;
	}

	get_unchecked(): Layer<ChannelSettingsRecordDialog>
	{
		return this.overlayer_store.get(
			ChannelSettingsDialog.ID,
		) as Layer<ChannelSettingsRecordDialog>;
	}

	exists(): boolean
	{
		return this.overlayer_store.has(ChannelSettingsDialog.ID);
	}

	with_data(data: ChannelSettingsRecordDialog)
	{
		this.overlayer_store.update_data(ChannelSettingsDialog.ID, data);
	}
}
