// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { User } from "~/user/User";

export class PrivateNick {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(user: User) {
		this.user = user;
	}

	// -------- //
	// Property //
	// -------- //

	private declare user: User;

	/**
	 * Est-ce que le pseudo du privé s'agit du client actuellement connecté
	 * l'application?
	 */
	isMe = false;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	/**
	 * @see User#id
	 */
	get id() {
		return this.user.id;
	}

	/**
	 * @see User#nickname
	 */
	get nickname() {
		return this.user.nickname;
	}

	/**
	 * @see User#ident
	 */
	get ident() {
		return this.user.ident;
	}

	/**
	 * @see User#username
	 */
	get hostname() {
		return this.user.hostname;
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Comparaison du pseudo privé.
	 */
	eq(other: this) {
		return (
			other.id === this.id &&
			other.nickname === this.nickname &&
			other.ident === this.ident &&
			other.hostname === this.hostname
		);
	}

	/**
	 * Comparaison partielle du pseudo privé.
	 */
	partialEq(other: this) {
		return other.id === this.id;
	}

	intoUser(): User {
		return this.user;
	}

	/**
	 * Définit ou non l'instance comme étant le client actuellement connecté
	 * l'application.
	 */
	withIsMe(bool: boolean): this {
		this.isMe = bool;
		return this;
	}
}
