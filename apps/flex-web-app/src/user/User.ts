// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ---- //
// Type //
// ---- //

export type UserID = string;

// -------------- //
// Implémentation //
// -------------- //

export class User {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(user: Origin) {
		this.id = user.id;
		this.nickname = user.nickname;
		this.ident = user.ident;
		this.host = user.host;
	}

	// -------- //
	// Property //
	// -------- //

	away = false;
	declare id: Origin["id"];
	declare nickname: Origin["nickname"];
	declare ident: Origin["ident"];
	declare host: Origin["host"];

	channels: Set<string> = new Set();

	get hostname() {
		return this.host.vhost || this.host.cloaked;
	}

	get className() {
		if (this.away) {
			return "is-away";
		}
		return "";
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	marksAsAway() {
		this.away = true;
	}

	marksAsNoLongerAway() {
		this.away = false;
	}

	withChannel(channelID: string): this {
		this.channels.add(channelID);
		return this;
	}
}
