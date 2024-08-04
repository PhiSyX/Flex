// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Room } from "../room";

// --------- //
// Interface //
// --------- //

export interface ListDataResponse
{
	channel: ChannelID;
	modes_settings: string;
	topic: string;
	total_members: number;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChannelListCustomRoom extends Room<CustomRoomID, "channel-list-custom-room">
{
	/**
	 * ID de la chambre personnalisée.
	 */
	public static ID: CustomRoomID = "@channel-list" as CustomRoomID;

	// ----------- //
	// Constructor //
	// ----------- //

	constructor()
	{
		super("channel-list-custom-room", "Liste des salons");
		this.with_id(ChannelListCustomRoom.ID);
	}

	// --------- //
	// Propriété //
	// --------- //

	/**
	 * La liste des salons publiques du serveur.
	 */
	channels: Map<ListDataResponse["channel"], ListDataResponse> = new Map();

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Efface tous les salons de l'instance.
	 */
	clear()
	{
		this.channels.clear();
	}

	/**
	 * Insère un nouveau salon du serveur.
	 */
	insert(data: ListDataResponse)
	{
		this.channels.set(data.channel, data);
	}
}
