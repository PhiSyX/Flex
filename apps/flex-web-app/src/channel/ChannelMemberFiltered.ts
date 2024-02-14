// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { FuzzySearchType } from "@phisyx/flex-search";
import { ChannelMember } from "./ChannelMember";

// ---- //
// Type //
// ---- //

export interface ChannelMemberSearchHits {
	isSymbol: boolean;
	type: FuzzySearchType;
	word: string;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChannelMemberFiltered {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Pseudo de salon filtré.
	 */
	declare member: ChannelMember;

	/**
	 * Résultat du filtre de recherche.
	 */
	declare searchHits: Array<ChannelMemberSearchHits>;

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(member: ChannelMember, searchHits: Array<ChannelMemberSearchHits> = []) {
		this.member = member;
		this.searchHits = searchHits;
	}
}
