// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Option } from "@phisyx/flex-safety";
import { ChannelMember } from "./ChannelMember";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelMemberSelected {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Pseudo de salon sélectionné.
	 */
	declare member: ChannelMember;

	/**
	 * Mask contenant le ban du membre.
	 */
	banned: Option<[MaskAddr, AccessControlMode["mask"]]> = None();

	/**
	 * Est-ce que le membre sélectionné est bloqué?
	 */
	declare isBlocked: boolean;

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(member: ChannelMember, isBlocked: boolean) {
		this.member = member;
		this.isBlocked = isBlocked;
	}

	/**
	 * Est-ce que le membre sélectionné est banni du salon?
	 */
	get isBanned() {
		return this.banned.is_some();
	}

	/**
	 * Est-ce que le pseudo du membre sélectionné est banni du salon?
	 */
	get isNickBanned() {
		return this.banned
			.filter(([_, mask]) => mask.nick !== "*" && mask.ident === "*" && mask.host === "*")
			.is_some();
	}

	withBanned(mask: this["banned"]) {
		this.banned = mask;
		return this;
	}
}
