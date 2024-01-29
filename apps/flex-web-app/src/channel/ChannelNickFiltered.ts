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
import { ChannelNick } from "./ChannelNick";

// ---- //
// Type //
// ---- //

export interface ChannelNickSearchHits {
	isSymbol: boolean;
	type: FuzzySearchType;
	word: string;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChannelNickFiltered {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Pseudo de salon filtré.
	 */
	declare cnick: ChannelNick;

	/**
	 * Résultat du filtre de recherche.
	 */
	declare searchHits: Array<ChannelNickSearchHits>;

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(cnick: ChannelNick, searchHits: Array<ChannelNickSearchHits> = []) {
		this.cnick = cnick;
		this.searchHits = searchHits;
	}
}
