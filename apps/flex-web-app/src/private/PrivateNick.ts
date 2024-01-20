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
	constructor(private origin: Origin) {}

	// -------- //
	// Property //
	// -------- //

	isMe = false;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get id() {
		return this.origin.id;
	}

	get nickname() {
		return this.origin.nickname;
	}

	get ident() {
		return this.origin.ident;
	}

	get host() {
		return this.origin.host;
	}

	get hostname() {
		return this.host.vhost || this.host.cloaked;
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
		return new User({
			id: this.id,
			host: this.host,
			ident: this.ident,
			nickname: this.nickname,
		});
	}

	withIsMe(bool: boolean): this {
		this.isMe = bool;
		return this;
	}
}
