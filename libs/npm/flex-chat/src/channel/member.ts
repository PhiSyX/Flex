// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { is_channel_member } from "../asserts/room";
import { User } from "../user";
import { ChannelAccessLevel, ChannelAccessLevelFlag } from "./access_level";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelMember extends User
{
	/**
	 * Les niveaux d'accès du pseudo.
	 */
	access_level: ChannelAccessLevel = new ChannelAccessLevel();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	/**
	 * Les classes CSS qu'il faut appliquer aux éléments de pseudo de salon.
	 */
	get class_name(): string
	{
		return `${super.class_name} ${this.access_level.highest.class_name}`;
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Est-ce que le membre a dans ses niveaux d'accès, un niveau d'accès
	 * minimal donné.
	 */
	ge_access_level(level: ChannelAccessLevelFlag): boolean
	{
		return this.access_level.ge(level);
	}

	/**
	 * Est-ce que le membre est opérateur du salon avec le niveau d'accès
	 * minimal à demi-opérateur.
	 */
	is_channel_operator(): boolean
	{
		return this.ge_access_level(ChannelAccessLevelFlag.HalfOperator);
	}

	// @ts-expect-error ;-)
	override partial_eq(user: this): boolean
	{
		if (is_channel_member(user)) {
			return user.nickname.toLowerCase() === this.nickname.toLowerCase();
		}

		return super.partial_eq(user);
	}

	/**
	 * Définit le niveau d'accès du pseudo.
	 */
	with_access_level(level: ChannelAccessLevelFlag | Array<string>): this
	{
		if (Array.isArray(level)) {
			let levels = this.access_level.parse(level);

			for (let level of levels) {
				this.access_level.add(level);
			}

			return this;
		}

		this.access_level.add(level);
		return this;
	}
}
