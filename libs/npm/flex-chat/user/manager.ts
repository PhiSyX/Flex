// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Option } from "@phisyx/flex-safety";

import { User } from "./index";

export class UserManager {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Tous les utilisateurs bloqués.
	 */
	private _blocked: Set<UserID> = new Set();

	/**
	 * Pseudonymes mis en cache pour faciliter la récupération d'un utilisateur
	 * par son pseudonyme.
	 */
	private _nicks: Map<User["nickname"], UserID> = new Map();

	/**
	 * Tous les utilisateurs connus ou en commun.
	 */
	private _users: Map<UserID, User> = new Map();

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute un nouvel utilisateur au Store.
	 */
	add(user_origin: User | Origin): User {
		let user: User = User.from(user_origin);

		let maybe_found_user = this.find(user.id).or_else(() =>
			this.find_by_nickname(user.nickname),
		);

		maybe_found_user.then((found_user) => {
			if (found_user.id !== user.id) {
				found_user.id = user.id;
				this.add_nickname(user.nickname, found_user.id);
			}
		});

		if (maybe_found_user.is_some()) {
			let found_user = maybe_found_user.unwrap();
			for (let channel of user.channels) {
				found_user.channels.add(channel);
			}
			return found_user;
		}

		this._users.set(user.id, user);

		// biome-ignore lint/style/noNonNullAssertion: Voir le code ci-haut.
		return this._users.get(user.id)!;
	}

	/**
	 * Ajoute un pseudonyme à la liste des utilisateurs connus par pseudonyme.
	 */
	add_nickname(nickname: string, user_id: UserID) {
		this._nicks.set(nickname.toLowerCase(), user_id);
	}

	/**
	 * Ajoute un utilisateur à la liste des utilisateurs bloqués.
	 */
	add_to_block(user_id: UserID) {
		this._blocked.add(user_id);
	}

	/**
	 * Change un ID utilisateur par un nouveau.
	 */
	change_id(old_user_id: UserID, new_user_id: UserID) {
		if (this.remove_to_block(old_user_id)) {
			this.add_to_block(new_user_id);
		}

		let maybe_user = this.del(old_user_id);
		if (maybe_user.is_none()) {
			return;
		}

		let user = maybe_user.unwrap();
		user.id = new_user_id;
		this.add(user);
	}

	/**
	 * Change le pseudonyme d'un utilisateur.
	 */
	change_nickname(old_nickname: string, new_nickname: string) {
		if (old_nickname.toLowerCase() === new_nickname.toLowerCase()) {
			return;
		}

		let maybe_user = this.find_by_nickname(old_nickname);
		let nick_id = this._nicks.get(old_nickname.toLowerCase());
		if (nick_id) {
			this.remove_nickname(old_nickname);
			this.add_nickname(new_nickname, nick_id);
		}
		if (maybe_user.is_none()) {
			return;
		}
		let user = maybe_user.unwrap();
		user.nickname = new_nickname;
	}

	/**
	 * Supprime un utilisateur de la liste des utilisateurs.
	 */
	del(user_id: UserID): Option<User> {
		let user = this.find(user_id);
		user.then((user) => {
			this.remove_nickname(user.nickname);
			this._users.delete(user_id);
		});
		return user;
	}

	/**
	 * Cherche un utilisateur en fonction d'un ID.
	 */
	find(user_id: UserID): Option<User> {
		return Option.from(this._users.get(user_id));
	}

	/**
	 * Cherche un utilisateur en fonction d'un pseudonyme.
	 */
	find_by_nickname(nickname: string): Option<User> {
		if (this._nicks.has(nickname.toLowerCase())) {
			let user_id = this._nicks.get(nickname.toLowerCase()) as UserID;
			return this.find(user_id);
		}

		let maybe_user = Option.from(
			Array.from(this._users.values()).find((user) =>
				user.partial_eq(nickname),
			),
		);

		maybe_user.then((user) => {
			this.add_nickname(user.nickname, user.id);
		});

		return maybe_user;
	}

	/**
	 * Vérifie qu'un utilisateur est dans la liste des utilisateurs bloqués.
	 */
	is_blocked(user_id: UserID): boolean {
		return this._blocked.has(user_id);
	}

	/**
	 * Supprime un pseudonyme de la liste des utilisateurs connus par pseudonyme.
	 */
	remove_nickname(nickname: string): boolean {
		return this._nicks.delete(nickname.toLowerCase());
	}

	/**
	 * Supprime un utilisateur de la liste des utilisateurs bloqués.
	 */
	remove_to_block(user_id: UserID): boolean {
		return this._blocked.delete(user_id);
	}

	/**
	 * Supprime un salon d'un utilisateur.
	 */
	remove_channel(user_id: UserID, channel_id: ChannelID) {
		let found_user = this.find(user_id);
		found_user.then((user) => user.channels.delete(channel_id));
	}

	/**
	 * Met à jour l'utilisateur de la liste des utilisateurs du client ou
	 * l'ajoute à la liste des utilisateurs.
	 */
	upsert(user_origin: User | Origin): User {
		let user: User = User.from(user_origin);

		let found_user = this._users.get(user.id);

		if (found_user) {
			found_user.away ||= user.away;
			found_user.channels = new Set([
				...found_user.channels,
				...user.channels,
			]);
			found_user.host = user.host;
			found_user.ident = user.ident;
			found_user.nickname = user.nickname;
			found_user.operator = user.operator;
			return found_user;
		}

		this._users.set(user.id, user);
		// biome-ignore lint/style/noNonNullAssertion: Voir le code ci-haut.
		return this._users.get(user.id)!;
	}
}
