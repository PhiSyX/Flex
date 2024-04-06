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

import { User } from "./User";

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
	add(userOrigin: User | Origin): User {
		let user: User;

		if (!(userOrigin instanceof User)) {
			user = new User(userOrigin);
		} else {
			user = userOrigin;
		}

		const maybeFoundUser = this.find(user.id).or_else(() => this.findByNickname(user.nickname));

		maybeFoundUser.then((foundUser) => {
			if (foundUser.id !== user.id) {
				foundUser.id = user.id;
				this._nicks.set(user.nickname, foundUser.id);
			}
		});

		if (maybeFoundUser.is_some()) {
			let foundUser = maybeFoundUser.unwrap();
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
	 * Ajoute un pseudonyme à la liste des utilisateurs connus par pseudonyme.
	 */
	addNickname(nickname: string, userID: UserID) {
		this._nicks.set(nickname.toLowerCase(), userID);
	}

	/**
	 * Ajoute un utilisateur à la liste des utilisateurs bloqués.
	 */
	addToBlock(userID: UserID) {
		this._blocked.add(userID);
	}

	/**
	 * Change un ID utilisateur par un nouveau.
	 */
	changeId(oldUserID: UserID, newUserID: UserID): void {
		if (this.removeToBlock(oldUserID)) {
			this.addToBlock(newUserID);
		}

		const maybeUser = this.del(oldUserID);
		if (maybeUser.is_none()) return;
		const user = maybeUser.unwrap();
		user.id = newUserID;
		this.add(user);
	}

	/**
	 * Change le pseudonyme d'un utilisateur.
	 */
	changeNickname(oldNickname: string, newNickname: string) {
		const maybeUser = this.findByNickname(oldNickname);
		const nick = this._nicks.get(oldNickname.toLowerCase());
		if (nick) {
			this._nicks.delete(oldNickname.toLowerCase());
			this._nicks.set(newNickname.toLowerCase(), nick);
		}
		if (maybeUser.is_none()) return;
		const user = maybeUser.unwrap();
		user.nickname = newNickname;
	}

	/**
	 * Supprime un utilisateur de la liste des utilisateurs.
	 */
	del(userID: UserID): Option<User> {
		let user = this.find(userID);
		user.then(() => this._users.delete(userID));
		return user;
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
	 * Supprime un pseudonyme de la liste des utilisateurs connus par pseudonyme.
	 */
	removeNickname(nickname: string): boolean {
		return this._nicks.delete(nickname.toLowerCase());
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
