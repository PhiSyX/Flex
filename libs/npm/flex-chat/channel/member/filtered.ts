// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { FuzzySearchType } from "@phisyx/flex-search/fuzzy_search";

import { ChannelMember } from "../member";

// ---- //
// Type //
// ---- //

export interface ChannelMemberSearchHits {
	is_symbol: boolean;
	type: FuzzySearchType;
	word: string;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChannelMemberFiltered extends ChannelMember {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Résultat du filtre de recherche.
	 */
	search_hits: Array<ChannelMemberSearchHits> = [];

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		member: ChannelMember,
		search_hits: Array<ChannelMemberSearchHits>,
	) {
		super(member);

		this.access_level = member.access_level;
		this.is_current_client = member.is_current_client;

		this.search_hits = search_hits;
	}
}

export class ChannelMemberUnfiltered extends ChannelMember {
	// --------- //
	// Propriété //
	// --------- //

	search_hits: Array<ChannelMemberSearchHits> = [];

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(member: ChannelMember) {
		super(member);

		this.access_level = member.access_level;
		this.is_current_client = member.is_current_client;
	}

	get class_name() {
		let cls = super.class_name;
		cls += " opacity=0.75";
		return cls;
	}
}
