// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { FuzzySearchType } from "@phisyx/flex-search";

import { ChannelMember } from "../member";

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

export class ChannelMemberFiltered extends ChannelMember {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Résultat du filtre de recherche.
	 */
	searchHits: Array<ChannelMemberSearchHits> = [];

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		member: ChannelMember,
		searchHits: Array<ChannelMemberSearchHits>,
	) {
		super(member);

		this.accessLevel = member.accessLevel;
		this.isCurrentClient = member.isCurrentClient;

		this.searchHits = searchHits;
	}
}

export class ChannelMemberUnfiltered extends ChannelMember {
	// --------- //
	// Propriété //
	// --------- //

	searchHits: Array<ChannelMemberSearchHits> = [];

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(member: ChannelMember) {
		super(member);

		this.accessLevel = member.accessLevel;
		this.isCurrentClient = member.isCurrentClient;
	}

	get className() {
		let cls = super.className;
		cls += " opacity=0.75";
		return cls;
	}
}
