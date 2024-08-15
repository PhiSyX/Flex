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

import type { Room } from "./index";

import { assert_channel_room, cast_to_room_id } from "../asserts/room";
import { ServerCustomRoom } from "../custom_room/server";

// ---- //
// Type //
// ---- //

type GetOptions = {
	where: {
		state?: "opened" | "closed";
		is_kicked?: boolean;
		is_custom?: boolean;
	};
	fallbacks?: Array<{
		active?: GetOptions,
		latest?: GetOptions,
		network?: boolean,
	}>,
};

// -------------- //
// Implémentation //
// -------------- //

export class RoomManager
{
	_last_room: Option<RoomID> = None();
	_current_room: Option<RoomID> = None();
	_rooms: Map<RoomID, Room> = new Map();
	_on_change: (room_id: RoomID, room: Room) => void = (_) => {};

	/**
	 * Récupère la chambre courante.
	 */
	active(options: GetOptions = {
		where: { state: "opened" },
	}): Room
	{
		return this._current_room
			.and_then((current_room) => this.get(current_room, options))
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
	close(room_id: RoomID, options?: GetOptions): Option<Room>
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

		return maybe_room;
	}

	/**
	 * Définit les rooms de la classe à partir d'un itérable.
	 */
	extends(rooms: Iterable<[RoomID, Room]>)
	{
		for (let [current_room_id, room] of rooms) {
			this._rooms.set(cast_to_room_id(current_room_id.toLowerCase()), room);
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
	 * Récupère un salon à partir de son ID.
	 */
	get(room_id: RoomID, options?: GetOptions): Option<Room>
	{
		let maybe_room = Option.from(
			this._rooms.get(cast_to_room_id(room_id.toLowerCase())),
		);

		if (options?.where) {
			maybe_room = maybe_room
				.filter((room) => {
					if (!options.where.state) {
						return true;
					}

					switch (options.where.state) {
						case "closed": return room.is_closed();
						case "opened": return !room.is_closed();
					}
				})
				.filter((room) => {
					if (options.where.is_kicked !== undefined) {
						if (room.type === "channel") {
							assert_channel_room(room);

							if (options.where.is_kicked) {
								return room.kicked;
							}

							return !room.kicked;
						}
					}

					if (options.where.is_custom) {
						return room.id().startsWith("@");
					}

					return true
				});
		}

		if (maybe_room.is_some()) {
			return maybe_room;
		}

		for (let fallback of options?.fallbacks || []) {
			if (fallback.active) {
				maybe_room = this.maybe_active(fallback.active);
				if (maybe_room.is_some()) {
					break;
				}
			} else if (fallback.latest) {
				maybe_room = this.last(fallback.latest);
				if (maybe_room.is_some()) {
					break;
				}
			} else if (fallback.network) {
				maybe_room = this.network();
				if (maybe_room.is_some()) {
					break;
				}
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
				return room.into_some();
			})
			.unwrap();
	}

	/**
	 * Vérifie qu'une chambre existe.
	 */
	has(room_id: RoomID, options: GetOptions = {
		where: { state: "opened" },
	}): boolean
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
	 * Récupère la dernière chambre ouverte (safe).
	 */
	last(options: GetOptions = {
		where: { state: "opened" },
	}): Option<Room>
	{
		return this._last_room.and_then(
			(last_room) => this.get(last_room, options)
		);
	}

	/**
	 * Récupère la chambre courante (SAFE).
	 */
	maybe_active(options: GetOptions = {
		where: { state: "opened" },
	}): Option<Room>
	{
		return this._current_room.and_then(
			(current_room) => this.get(current_room, options)
		);
	}

	/**
	 * Récupère le chambre réseau.
	 */
	network(): Option<Room>
	{
		return this.get(ServerCustomRoom.ID);
	}

	/**
	 * Supprime une chambre à partir de son ID.
	 */
	remove(room_id: RoomID, options: GetOptions = {
		where: { state: "opened" },
	}): Option<Room>
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
		this._last_room = this._current_room.clone();

		if (this._current_room.is_some()) {
			this.current().set_active(false);
			this.current().set_highlighted(false);
			this.current().unset_total_unread_events();
			this.current().unset_total_unread_mentions();
			this.current().unset_total_unread_messages();
		}

		this._current_room.replace(cast_to_room_id(room_id.toLowerCase()));

		this.current().set_active(true);
		this.current().set_highlighted(false);
		this.current().unset_total_unread_events();
		this.current().unset_total_unread_mentions();
		this.current().unset_total_unread_messages();

		this._on_change(
			cast_to_room_id(room_id.toLowerCase()),
			this.get(room_id).unwrap_unchecked(),
		);
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

	set_on_change(cb: this["_on_change"])
	{
		this._on_change = cb;
	}

	/**
	 * Définit la chambre courante comme vide.
	 */
	unset_current()
	{
		this._last_room = this._current_room.clone();
		this._current_room = None();
	}
}
