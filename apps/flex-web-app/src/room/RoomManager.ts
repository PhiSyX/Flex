// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Option } from "@phisyx/flex-safety";

import { Room, RoomID } from "./Room";

// -------------- //
// Implémentation //
// -------------- //

export class RoomManager {
	_currentRoom: Option<RoomID> = None();
	_rooms: Map<RoomID, Room> = new Map();

	/**
	 * Définit les rooms de la classe à partir d'un itérable.
	 */
	extends(rooms: Iterable<[RoomID, Room]>) {
		for (const [roomID, room] of rooms) {
			this._rooms.set(roomID.toLowerCase(), room);
		}
	}

	/**
	 * Chambre courante
	 */
	current(): Room {
		return this._currentRoom
			.and_then((current_room) => this.get(current_room))
			.expect("La chambre courante");
	}

	/**
	 * Récupère un chambre à partir de son ID.
	 */
	get(roomID: RoomID): Option<Room> {
		return Option.from(this._rooms.get(roomID.toLowerCase()));
	}

	/**
	 * Définit une chambre courante.
	 */
	setCurrent(roomID: RoomID) {
		if (this._currentRoom.is_some()) {
			this.current().setActive(false);
		}

		this._currentRoom.replace(roomID.toLowerCase());

		this.current().setActive(true);
	}
}
