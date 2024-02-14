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
import {
	ChannelAccessLevel,
	HighestAccessLevelOutput,
	highestAccessLevel,
	parseAccessLevels,
} from "./ChannelAccessLevel";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelMember {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(user: User) {
		this.user = user;
	}

	// --------- //
	// Propriété //
	// --------- //

	private declare _highestAccessLevel: HighestAccessLevelOutput;

	private declare user: User;

	/**
	 * Les niveaux d'accès du pseudo.
	 */
	accessLevel: Set<ChannelAccessLevel> = new Set();

	/**
	 * Est-ce le pseudonyme est le pseudonyme courant connecté.
	 */
	isCurrentClient = false;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	/**
	 * Les classes CSS qu'il faut appliquer aux éléments de pseudo de salon.
	 */
	get className() {
		return `${this.user.className} ${this.highestAccessLevel.className}`;
	}

	/**
	 * Niveau d'accès du pseudo le plus haut gradé.
	 */
	get highestAccessLevel() {
		if (!this._highestAccessLevel) {
			this._highestAccessLevel = highestAccessLevel(this.accessLevel);
		}
		return this._highestAccessLevel;
	}

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
	 * @see User#hostname
	 */
	get hostname() {
		return this.user.hostname;
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Est-ce que le membre a dans ses niveaux d'accès, un niveau d'accès
	 * minimal donné.
	 */
	hasAccessLevel(level: ChannelAccessLevel): boolean {
		return this.highestAccessLevel.level >= level;
	}

	/**
	 * Est-ce que le membre est opérateur du salon avec le niveau d'accès
	 * minimal à demi-opérateur.
	 */
	isOperator(): boolean {
		return this.hasAccessLevel(ChannelAccessLevel.HalfOperator);
	}

	/**
	 * Est-ce que le membre donné correspond à celui de l'instance.
	 */
	eq(member: this): boolean {
		return (
			member === this ||
			(member.id === this.id &&
				member.nickname === this.nickname &&
				member.ident === this.ident &&
				member.hostname === this.hostname)
		);
	}

	/**
	 * Est-ce que le pseudo donné correspond à celui de l'instance, comparaison
	 * partielle
	 */
	partialEq(member: this): boolean {
		return member.nickname.toLowerCase() === this.nickname.toLowerCase();
	}

	intoUser(): User {
		return this.user;
	}

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
	withIsCurrentClient(bool: boolean): this {
		this.isCurrentClient = bool;
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
