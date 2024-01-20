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

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get nickname() {
		return this.origin.nickname;
	}

	get ident() {
		return this.origin.ident;
	}

	get hostname() {
		return this.origin.host.vhost || this.origin.host.cloaked;
	}

	// ------- //
	// Méthode //
	// ------- //

	public eq(other: this) {
		return (
			other.nickname === this.nickname &&
			other.ident === this.ident &&
			other.hostname === this.hostname
		);
	}

	public partialEq(other: this) {
		return other.nickname.toLowerCase() === this.nickname.toLowerCase();
	}

	public intoUser(): User {
		return new User({
			host: this.origin.host,
			ident: this.ident,
			nickname: this.nickname,
		});
	}
}
