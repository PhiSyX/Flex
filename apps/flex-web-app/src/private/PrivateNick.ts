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
	constructor(private user: User) {}

	// -------- //
	// Property //
	// -------- //

	isMe = false;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get id() {
		return this.user.id;
	}

	get nickname() {
		return this.user.nickname;
	}

	get ident() {
		return this.user.ident;
	}

	get hostname() {
		return this.user.hostname;
	}

	// ------- //
	// Méthode //
	// ------- //

	public eq(other: this) {
		return (
			other.id === this.id &&
			other.nickname === this.nickname &&
			other.ident === this.ident &&
			other.hostname === this.hostname
		);
	}

	public partialEq(other: this) {
		return other.id === this.id;
	}

	public intoUser(): User {
		return this.user;
	}

	withIsMe(bool: boolean): this {
		this.isMe = bool;
		return this;
	}
}
