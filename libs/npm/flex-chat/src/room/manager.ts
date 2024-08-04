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

import type { Room } from "./index";

import { assert_channel_room, cast_to_room_id } from "../asserts/room";
import { ServerCustomRoom } from "../custom_room/server";

// -------------- //
// Implémentation //
// -------------- //

export class RoomManager
{
	_current_room: Option<RoomID> = None();
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
	): Room
	{
		return this._current_room
			.and_then((current_room) => this.get(current_room))
			.filter_map((room) => {
				if (room.type === "channel-list-custom-room") {
					return this.get(ServerCustomRoom.ID);
				}

				if (room.type === "channel") {
					if (options.state === "opened:not-kicked") {
						assert_channel_room(room);
						if (!room.is_closed() && room.kicked) {
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
	change_id(old_room_id: RoomID, new_room_id: RoomID): void
	{
		let is_current_room = this.current().id() === old_room_id;
		let maybe_room = this.remove(old_room_id);
		if (maybe_room.is_none()) {
			return;
		}
		let room = maybe_room.unwrap();
		room.with_id(new_room_id);
		this.insert(new_room_id, room);
		if (is_current_room) {
			this.set_current(new_room_id);
		}
	}

	/**
	 * Ferme une chambre à partir de son ID.
	 */
	close(
		room_id: RoomID,
		options?: { state: "opened" | "closed" },
	): Option<Room>
	{
		if (this._current_room.is_some()) {
			if (this.current().eq(room_id)) {
				this.unset_current();
			}
		}
		let maybe_room = this.get(room_id, options);
		if (maybe_room.is_some()) {
			let room = maybe_room.unwrap();
			room.marks_as_closed();
		}
		if (this._current_room.is_none()) {
			this.set_current_to_last();
		}

		if (maybe_room.is_some()) {
			return Some(maybe_room.unwrap());
		}

		return None();
	}

	/**
	 * Définit les rooms de la classe à partir d'un itérable.
	 */
	extends(rooms: Iterable<[RoomID, Room]>)
	{
		for (let [current_room_id, r00m] of rooms) {
			this._rooms.set(cast_to_room_id(current_room_id.toLowerCase()), r00m);
		}
	}

	/**
	 * Chambre courante
	 */
	current(): Room
	{
		return this._current_room
			.and_then((current_room) => this.get(current_room))
			.expect("La chambre courante");
	}

	/**
	 * Récupère un chambre ouverte à partir de son ID.
	 */
	get(
		room_id: RoomID,
		options: {
			state: "opened" | "closed" | "opened:not-kicked";
		} = { state: "opened" },
	): Option<Room>
	{
		let maybe_room = Option.from(
			this._rooms.get(cast_to_room_id(room_id.toLowerCase())),
		);

		if (options) {
			switch (options.state) {
				case "closed":
					return maybe_room.filter((room) => room.is_closed());

				case "opened":
					return maybe_room.filter((room) => !room.is_closed());

				case "opened:not-kicked":
					return maybe_room.filter((room) => {
						if (room.type === "channel") {
							assert_channel_room(room);
							return !room.kicked;
						}
						return true;
					});
			}
		}

		return maybe_room;
	}

	/**
	 * Récupère une chambre en fonction de son ID ou insère une nouvelle chambre
	 * si la chambre demandée n'existe pas.
	 */
	get_or_insert(room_id: RoomID, fallback: () => Room): Room
	{
		return this.get(room_id)
			.or_else(() => {
				let room = fallback();
				this.insert(room_id, room);
				return Some(room);
			})
			.unwrap()
			.marks_as_opened();
	}

	/**
	 * Vérifie qu'une chambre existe.
	 */
	has(room_id: RoomID, options?: { state: "opened" | "closed" }): boolean
	{
		return this.get(room_id, options).is_some();
	}

	/**
	 * Ajoute une nouvelle chambre.
	 */
	insert(new_room_id: RoomID, new_room: Room): Room
	{
		this._rooms.set(cast_to_room_id(new_room_id.toLowerCase()), new_room);
		return new_room;
	}

	/**
	 * Supprime une chambre à partir de son ID.
	 */
	remove(
		room_id: RoomID,
		options?: { state: "opened" | "closed" },
	): Option<Room>
	{
		let maybe_room = this.get(room_id, options);
		maybe_room.then(() => this._rooms.delete(cast_to_room_id(room_id.toLowerCase())));
		return maybe_room;
	}

	/**
	 * Toutes les chambres.
	 */
	rooms(): Array<Room>
	{
		return Array.from(this._rooms.values());
	}

	/**
	 * Définit une chambre courante.
	 */
	set_current(room_id: RoomID)
	{
		if (this._current_room.is_some()) {
			this.current().set_active(false);
			this.current().set_highlighted(false);
			this.current().unset_total_unread_events();
			this.current().unset_total_unread_messages();
		}

		this._current_room.replace(cast_to_room_id(room_id.toLowerCase()));

		this.current().set_active(true);
		this.current().set_highlighted(false);
		this.current().unset_total_unread_events();
		this.current().unset_total_unread_messages();
	}

	/**
	 * Définit la chambre courante à la dernière chambre.
	 */
	set_current_to_last()
	{
		let rooms = this.rooms().filter((room) => !room.is_closed());
		let maybe_last_room_id = Option.from(rooms.at(-1));
		maybe_last_room_id.then((room) => this.set_current(room.id()));
	}

	/**
	 * Définit la chambre courante comme vide.
	 */
	unset_current()
	{
		this._current_room = None();
	}
}
