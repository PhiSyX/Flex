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
	type HighestAccessLevelOutput,
	highestAccessLevel,
	parseAccessLevels,
} from "./ChannelAccessLevel";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelMember extends User {
	// --------- //
	// Propriété //
	// --------- //

	private declare _highestAccessLevel: HighestAccessLevelOutput;

	/**
	 * Les niveaux d'accès du pseudo.
	 */
	accessLevel: Set<ChannelAccessLevel> = new Set();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	/**
	 * Les classes CSS qu'il faut appliquer aux éléments de pseudo de salon.
	 */
	get className(): string {
		return `${super.className} ${this.highestAccessLevel.className}`;
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
	isChanOperator(): boolean {
		return this.hasAccessLevel(ChannelAccessLevel.HalfOperator);
	}

	/**
	 * Définit le niveau d'accès du pseudo.
	 */
	withAccessLevel(level: ChannelAccessLevel): this {
		this.accessLevel.add(level);
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
