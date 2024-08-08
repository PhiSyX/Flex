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

// -------------- //
// Implémentation //
// -------------- //

export class MentionsCustomRoom extends Room<CustomRoomID, "mentions-custom-room">
{
	/**
	 * ID de la chambre personnalisée.
	 */
	public static ID: CustomRoomID = "@mentions" as CustomRoomID;

	// ----------- //
	// Constructor //
	// ----------- //

	constructor()
	{
		super("mentions-custom-room", "Mentions");
		this.with_id(MentionsCustomRoom.ID);
	}

	// --------- //
	// Propriété //
	// --------- //

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Efface toutes les mentions de l'instance.
	 */
	clear()
	{
		// this.channels.clear();
	}

	/**
	 * Insère une nouvelle mention au salon sur le serveur.
	 */
	insert(data: unknown)
	{
		// this.channels.set(data.channel, data);
	}
}
