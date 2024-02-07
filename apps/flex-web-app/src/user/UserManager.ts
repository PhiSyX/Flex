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

import { ChannelID } from "~/channel/ChannelRoom";
import { User, UserID } from "./User";

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
	private _nicks: Map<string, UserID> = new Map();

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
	add(userOrigin: User | Origin): User {
		let user: User;

		if (!(userOrigin instanceof User)) {
			user = new User(userOrigin);
		} else {
			user = userOrigin;
		}

		const foundUser = this._users.get(user.id);

		if (foundUser) {
			for (const channel of user.channels) {
				foundUser.channels.add(channel);
			}
			return foundUser;
		}

		this._users.set(user.id, user);

		// biome-ignore lint/style/noNonNullAssertion: Voir le code ci-haut.
		return this._users.get(user.id)!;
	}

	/**
	 * Ajoute un utilisateur à la liste des utilisateurs bloqués.
	 */
	addToBlock(userID: UserID) {
		this._blocked.add(userID);
	}

	/**
	 * Change le pseudonyme d'un utilisateur.
	 */
	changeNickname(oldNickname: string, newNickname: string) {
		const user = this.findByNickname(oldNickname).unwrap();
		this._nicks.delete(oldNickname.toLowerCase());
		user.nickname = newNickname;
	}

	/**
	 * Cherche un utilisateur en fonction d'un ID.
	 */
	find(userID: UserID): Option<User> {
		return Option.from(this._users.get(userID));
	}

	/**
	 * Cherche un utilisateur en fonction d'un pseudonyme.
	 */
	findByNickname(nickname: string): Option<User> {
		if (this._nicks.has(nickname.toLowerCase())) {
			const userID = this._nicks.get(nickname.toLowerCase()) as UserID;
			return this.find(userID);
		}

		const maybeUser = Option.from(
			Array.from(this._users.values()).find(
				(user) => user.nickname.toLowerCase() === nickname.toLowerCase(),
			),
		);

		maybeUser.then((user) => {
			this._nicks.set(user.nickname.toLowerCase(), user.id);
		});

		return maybeUser;
	}

	/**
	 * Vérifie qu'un utilisateur est dans la liste des utilisateurs bloqués.
	 */
	isBlocked(userID: UserID): boolean {
		return this._blocked.has(userID);
	}

	/**
	 * Supprime un utilisateur de la liste des utilisateurs bloqués.
	 */
	removeToBlock(userID: UserID): boolean {
		return this._blocked.delete(userID);
	}

	/**
	 * Supprime un salon d'un utilisateur.
	 */
	removeChannel(userID: UserID, channelID: ChannelID) {
		let foundUser = this.find(userID);
		foundUser.then((user) => user.channels.delete(channelID));
	}

	/**
	 * Met à jour l'utilisateur de la liste des utilisateurs du client ou
	 * l'ajoute à la liste des utilisateurs.
	 */
	upsert(userOrigin: User | Origin): User {
		let user: User;

		if (!(userOrigin instanceof User)) {
			user = new User(userOrigin);
		} else {
			user = userOrigin;
		}

		const foundUser = this._users.get(user.id);

		if (foundUser) {
			foundUser.away ||= user.away;
			foundUser.channels = new Set([...foundUser.channels, ...user.channels]);
			foundUser.host = user.host;
			foundUser.ident = user.ident;
			foundUser.nickname = user.nickname;
			foundUser.operator = user.operator;
			return foundUser;
		}

		this._users.set(user.id, user);
		// biome-ignore lint/style/noNonNullAssertion: Voir le code ci-haut.
		return this._users.get(user.id)!;
	}
}
