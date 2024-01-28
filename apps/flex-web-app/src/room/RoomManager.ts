// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Option, Some } from "@phisyx/flex-safety";

import { Room, RoomID } from "./Room";

// -------------- //
// Implémentation //
// -------------- //

export class RoomManager {
	_currentRoom: Option<RoomID> = None();
	_rooms: Map<RoomID, Room> = new Map();

	/**
	 * Chambre courante à l'exception des chambres de type suivants:
	 *
	 * 	- "channel-list-custom-room"
	 */
	active(): Room {
		return this._currentRoom
			.and_then((currentRoom) => this.get(currentRoom))
			.filter_map((customRoom) => {
				if (customRoom.type === "channel-list-custom-room") {
					return this.get("Flex");
				}
				return Some(customRoom);
			})
			.expect("La chambre courante");
	}

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
			.and_then((currentRoom) => this.get(currentRoom))
			.expect("La chambre courante");
	}

	/**
	 * Récupère un chambre à partir de son ID.
	 */
	get(roomID: RoomID): Option<Room> {
		return Option.from(this._rooms.get(roomID.toLowerCase()));
	}

	/**
	 * Récupère une chambre en fonction de son ID ou insère une nouvelle chambre
	 * si la chambre demandée n'existe pas.
	 */
	getOrInsert(roomID: RoomID, fallback: () => Room): Room {
		return this.get(roomID)
			.or_else(() => {
				const room = fallback();
				this.insert(roomID, room);
				return Some(room);
			})
			.unwrap()
			.marksAsOpen();
	}

	/**
	 * Vérifie qu'une chambre existe.
	 */
	has(roomID: RoomID): boolean {
		return this.get(roomID).is_some();
	}

	/**
	 * Ajoute une nouvelle chambre.
	 */
	insert(roomID: RoomID, room: Room): Room {
		this._rooms.set(roomID.toLowerCase(), room);
		return room;
	}

	/**
	 * Supprime une chambre à partir de son ID.
	 */
	remove(roomID: RoomID) {
		if (this._currentRoom.is_some()) {
			if (this.current().eq(roomID)) {
				this.unsetCurrent();
			}
		}
		const maybeRoom = this.get(roomID);
		if (maybeRoom.is_some()) {
			const room = maybeRoom.unwrap();
			room.marksAsClosed();
		}
		if (this._currentRoom.is_none()) {
			this.setCurrentToLast();
		}
	}

	/**
	 * Toutes les chambres.
	 */
	rooms(): Array<Room> {
		return Array.from(this._rooms.values());
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

	/**
	 * Définit la chambre courante à la dernière chambre.
	 */
	setCurrentToLast() {
		const rooms = this.rooms().filter((room) => !room.isClosed());
		const maybeLastRoomID = Option.from(rooms.at(-1));
		maybeLastRoomID.then((room) => this.setCurrent(room.id()));
	}

	/**
	 * Définit la chambre courante comme vide.
	 */
	unsetCurrent() {
		this._currentRoom = None();
	}
}
