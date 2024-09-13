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

export class ServerCustomRoom extends Room<CustomRoomID, "server-custom-room"> {
	/**
	 * ID de la chambre personnalisée.
	 */
	public static ID: CustomRoomID = "@flex" as CustomRoomID;
	public static NAME = "Flex";

	// ----------- //
	// Constructor //
	// ----------- //

	constructor() {
		super("server-custom-room", ServerCustomRoom.NAME);
		this.with_id(ServerCustomRoom.ID);
	}

	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Connecté ou non
	 */
	connected = false;

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Est-ce que le serveur est connecté?
	 */
	is_connected(): boolean {
		return this.connected;
	}

	/**
	 * Définit le serveur comme étant connecté ou non.
	 */
	set_connected(bool: boolean) {
		this.connected = bool;
	}
}
