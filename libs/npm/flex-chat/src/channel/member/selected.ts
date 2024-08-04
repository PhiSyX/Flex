// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, type Option } from "@phisyx/flex-safety";
import type { ChannelMember } from "../member";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelMemberSelected
{
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Pseudo de salon sélectionné.
	 */
	member: ChannelMember;

	/**
	 * Mask contenant le ban du membre.
	 */
	banned: Option<[MaskAddr, AccessControlMode["mask"]]> = None();

	/**
	 * Est-ce que le membre sélectionné est bloqué?
	 */
	is_blocked: boolean;

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		member: ChannelMemberSelected["member"],
		is_blocked: ChannelMemberSelected["is_blocked"]
	)
	{
		this.member = member;
		this.is_blocked = is_blocked;
	}

	/**
	 * Est-ce que le membre sélectionné est banni du salon?
	 */
	get is_banned()
	{
		return this.banned.is_some();
	}

	/**
	 * Est-ce que le pseudo du membre sélectionné est banni du salon?
	 */
	get is_nick_banned()
	{
		return this.banned
			.filter(([_, { host, ident, nick }]) => {
				return nick !== "*" && ident === "*" && host === "*";
			})
			.is_some();
	}

	with_banned(mask: this["banned"])
	{
		this.banned = mask;
		return this;
	}
}
