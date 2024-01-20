// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import {
	ChannelAccessLevel,
	HighestAccessLevelOutput,
	highestAccessLevel,
	parseAccessLevels,
} from "./ChannelAccessLevel";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelNick {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(origin: Origin) {
		this.id = origin.id;
		this.nickname = origin.nickname;
		this.ident = origin.ident;
		this.host = origin.host;
	}

	// --------- //
	// Propriété //
	// --------- //

	private declare _highestAccessLevel: HighestAccessLevelOutput;

	/**
	 * ID.
	 */
	declare id: string;
	/**
	 * Pseudonyme.
	 */
	declare nickname: string;
	/**
	 * Ident
	 */
	declare ident: string;
	/**
	 * Host
	 */
	declare host: {
		cloaked: string;
		vhost?: string;
	};

	/**
	 * Les niveaux d'accès du pseudo.
	 */
	accessLevel: Set<ChannelAccessLevel> = new Set();

	/**
	 * Est-ce le pseudonyme est le pseudonyme courant connecté.
	 */
	isMe = false;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	/**
	 * Niveau d'accès du pseudo le plus haut gradé.
	 */
	get highestAccessLevel() {
		if (!this._highestAccessLevel) {
			this._highestAccessLevel = highestAccessLevel(this.accessLevel);
		}
		return this._highestAccessLevel;
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Définit le niveau d'accès du pseudo.
	 */
	withAccessLevel(level: ChannelAccessLevel): this {
		this.accessLevel.add(level);
		return this;
	}

	/**
	 * Définit le pseudo comme étant celui actuellement connecté en tant que
	 * client.
	 */
	withIsMe(bool: boolean): this {
		this.isMe = bool;
		return this;
	}

	/**
	 * Définit les niveaux d'accès du pseudo (raw).
	 */
	withRawAccessLevel(raw: Array<string>): this {
		const levels = parseAccessLevels(raw);
		for (const level of levels) {
			this.withAccessLevel(level);
		}
		return this;
	}
}
