// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Result } from "@phisyx/flex-safety";
import type { ZodError } from "zod";

import { Err, Ok } from "@phisyx/flex-safety";
import { z } from "zod";

export type CountriesResponse = Array<{ code: string; country: string }>;

export class Countries {
	// ------ //
	// Static //
	// ------ //

	static SCHEMA_ITEM = z.object({
		code: z.string(),
		country: z.string(),
	});
	static SCHEMA = z.array(Countries.SCHEMA_ITEM);

	static parse(
		response?: CountriesResponse,
	): Result<Countries, CountriesError> {
		let maybe = Countries.SCHEMA.safeParse(response);
		if (maybe.error) {
			return Err(new CountriesError(maybe.error));
		}
		return Ok(new Countries(maybe.data)) as Result<
			Countries,
			CountriesError
		>;
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(payload: CountriesResponse) {
		this.list = payload;
	}

	// --------- //
	// Propriété //
	// --------- //

	private list: CountriesResponse;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	/**
	 * Calcule l'âge en fonction de la date de naissance.
	 */
	data() {
		return this.list;
	}
}

class CountriesError extends Error {
	name = "CountriesError";
	stack = undefined;

	constructor(zod_err: ZodError) {
		super(
			"Une erreur est survenue lors de l'analyse des données de la requête d'API `Countries`.",
		);
		this.cause = zod_err;
	}
}
