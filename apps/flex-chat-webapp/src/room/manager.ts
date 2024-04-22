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

import type { Room } from "./room";

import { assertChannelRoom, roomID } from "~/asserts/room";
import { ServerCustomRoom } from "~/custom_room/server";

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
	active(
		options: {
			state: "opened" | "closed" | "opened:not-kicked";
		} = { state: "opened" },
	): Room {
		return this._currentRoom
			.and_then((currentRoom) => this.get(currentRoom))
			.filter_map((room) => {
				if (room.type === "channel-list-custom-room") {
					return this.get(ServerCustomRoom.ID);
				}
				if (room.type === "channel") {
					if (options.state === "opened:not-kicked") {
						assertChannelRoom(room);
						if (!room.isClosed() && room.kicked) {
							return this.get(ServerCustomRoom.ID);
						}
					}
				}
				return Some(room);
			})
			.expect("La chambre courante");
	}

	/**
	 * Change un ID par un nouveau.
	 */
	changeId(oldRoomID: RoomID, newRoomID: RoomID): void {
		const isCurrentRoom = this.current().id() === oldRoomID;
		const maybeRoom = this.remove(oldRoomID);
		if (maybeRoom.is_none()) return;
		const room = maybeRoom.unwrap();
		room.withID(newRoomID);
		this.insert(newRoomID, room);
		if (isCurrentRoom) {
			this.setCurrent(newRoomID);
		}
	}

	/**
	 * Ferme une chambre à partir de son ID.
	 */
	close(
		roomID: RoomID,
		options?: { state: "opened" | "closed" },
	): Option<Room> {
		if (this._currentRoom.is_some()) {
			if (this.current().eq(roomID)) {
				this.unsetCurrent();
			}
		}
		const maybeRoom = this.get(roomID, options);
		if (maybeRoom.is_some()) {
			const room = maybeRoom.unwrap();
			room.marksAsClosed();
		}
		if (this._currentRoom.is_none()) {
			this.setCurrentToLast();
		}

		if (maybeRoom.is_some()) {
			return Some(maybeRoom.unwrap());
		}

		return None();
	}

	/**
	 * Définit les rooms de la classe à partir d'un itérable.
	 */
	extends(rooms: Iterable<[RoomID, Room]>) {
		for (const [currentRoomID, r00m] of rooms) {
			this._rooms.set(roomID(currentRoomID.toLowerCase()), r00m);
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
	 * Récupère un chambre ouverte à partir de son ID.
	 */
	get(
		currentRoomID: RoomID,
		options: {
			state: "opened" | "closed" | "opened:not-kicked";
		} = { state: "opened" },
	): Option<Room> {
		const maybeRoom = Option.from(
			this._rooms.get(roomID(currentRoomID.toLowerCase())),
		);

		if (options) {
			switch (options.state) {
				case "closed":
					return maybeRoom.filter((room) => room.isClosed());

				case "opened":
					return maybeRoom.filter((room) => !room.isClosed());

				case "opened:not-kicked":
					return maybeRoom.filter((room) => {
						if (room.type === "channel") {
							assertChannelRoom(room);
							return !room.kicked;
						}
						return true;
					});
			}
		}

		return maybeRoom;
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
	has(roomID: RoomID, options?: { state: "opened" | "closed" }): boolean {
		return this.get(roomID, options).is_some();
	}

	/**
	 * Ajoute une nouvelle chambre.
	 */
	insert(newRoomID: RoomID, newRoom: Room): Room {
		this._rooms.set(roomID(newRoomID.toLowerCase()), newRoom);
		return newRoom;
	}

	/**
	 * Supprime une chambre à partir de son ID.
	 */
	remove(
		roomId: RoomID,
		options?: { state: "opened" | "closed" },
	): Option<Room> {
		const maybeRoom = this.get(roomId, options);
		maybeRoom.then(() => this._rooms.delete(roomID(roomId.toLowerCase())));
		return maybeRoom;
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
	setCurrent(currentRoomID: RoomID) {
		if (this._currentRoom.is_some()) {
			this.current().setActive(false);
			this.current().setHighlighted(false);
			this.current().unsetTotalUnreadEvents();
			this.current().unsetTotalUnreadMessages();
		}

		this._currentRoom.replace(roomID(currentRoomID.toLowerCase()));

		this.current().setActive(true);
		this.current().setHighlighted(false);
		this.current().unsetTotalUnreadEvents();
		this.current().unsetTotalUnreadMessages();
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
