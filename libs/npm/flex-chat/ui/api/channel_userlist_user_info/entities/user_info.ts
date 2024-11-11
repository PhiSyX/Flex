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

import { calculate_age } from "@phisyx/flex-date/calculate_age";
import { iso_to_country_flag } from "@phisyx/flex-helpers";
import { Err, Ok, Option } from "@phisyx/flex-safety";
import { z } from "zod";

export interface UserInfoResponse {
	birthday?: string | null;
	country?: string | null;
	city?: string | null;
}

export class UserInfo implements UserInfoResponse {
	// ------ //
	// Static //
	// ------ //

	static SCHEMA = z.object({
		birthday: z.string().nullable(),
		country: z.string().nullable(),
		city: z.string().nullable(),
	});

	static parse(response?: UserInfoResponse): Result<UserInfo, UserInfoError> {
		let maybe = UserInfo.SCHEMA.safeParse(response);
		if (maybe.error) {
			return Err(new UserInfoError(maybe.error));
		}
		return Ok(new UserInfo(maybe.data)) as Result<UserInfo, UserInfoError>;
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(payload: UserInfoResponse) {
		this.birthday = payload.birthday;
		this.city = payload.city;
		this.country = payload.country;
	}

	// --------- //
	// Propriété //
	// --------- //

	birthday?: string | null;
	country?: string | null;
	city?: string | null;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	/**
	 * Calcule l'âge en fonction de la date de naissance.
	 */
	age(): Option<number> {
		return Option.from(this.birthday).map(calculate_age);
	}

	/**
	 * D'où vient l'utilisateur
	 */
	comes_from(): Option<string> {
		return this.country_safe().or(this.city_safe());
	}

	/**
	 * Drapeau du pays ou initial de la ville de l'utilisateur
	 *
	 * @example
	 * 	Italie 	 = 🇮🇹	 (Pays)
	 * 	New York = NY (Ville)
	 * 	Paris	 = P  (Ville)
	 */
	comes_from_initials(): Option<string> {
		return this.country_safe()
			.map(iso_to_country_flag)
			.or_else(() =>
				this.city_safe().map((city) =>
					city
						.split(/[\s-]/g)
						.map((w) => w.slice(0, 1))
						.join(""),
				),
			);
	}

	/**
	 * Pays
	 */
	country_safe(): Option<string> {
		return Option.from(this.country);
	}

	/**
	 * Ville
	 */
	city_safe(): Option<string> {
		return Option.from(this.city);
	}
}

class UserInfoError extends Error {
	name = "UserInfoError";
	stack = undefined;

	constructor(zod_err: ZodError) {
		super(
			"Une erreur est survenue lors de l'analyse des données de la requête d'API `UserInfo`.",
		);
		this.cause = zod_err;
	}
}
