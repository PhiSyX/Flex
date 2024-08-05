// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ---- //
// Type //
// ---- //

export interface ChatStoreUUIDExt
{
	uuid(version: UUIDVariant): UUIDStore;
}

type u8r25 =
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16
	| 17
	| 18
	| 19
	| 20
	| 21
	| 22
	| 23
	| 24
	| 25;

export type UUIDVariant = 4 | 7;

// -------- //
// Constant //
// -------- //

export const UUID_V4 = 4 as const;
export const UUID_V7 = 7 as const;

const MAX_NTIMES: u8r25 = 25;

// -------------- //
// Implémentation //
// -------------- //

export class UUIDStore
{
	// ------ //
	// Static //
	// ------ //

	static IDv4 = "uuidv4-store";
	static IDv7 = "uuidv7-store";

	static v4(): UUIDStore
    {
		return new UUIDStore(4);
	}

	static v7(): UUIDStore
    {
		return new UUIDStore(7);
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		version: UUIDStore["version"] = UUID_V7,
		ntimes: UUIDStore["ntimes"] = MAX_NTIMES,
	)
    {
		this.version = version;
		this.ntimes = ntimes;

		this.populate();
	}

	// --------- //
	// Propriété //
	// --------- //

	uuids: Array<string> = [];
	version: UUIDVariant;
	ntimes: u8r25;

	// ------- //
	// Méthode //
	// ------- //

	populate()
    {
		let UUID_URL_searchParams = new URLSearchParams();
		UUID_URL_searchParams.set("ntimes", this.ntimes.toString());

		const variant = `v${this.version}`;
		const queries = UUID_URL_searchParams.toString();

		let generate_UUID_URL = `/generate/uuid/${variant}?${queries}`;

		fetch(generate_UUID_URL).then(async (response) => {
			this.uuids.push(...(await response.json()));
		});
	}

	take(n?: u8r25): Array<string>
    {
		const ntimes = Number(n) ?? 1;
		const uuids = this.uuids.splice(0, ntimes);
		if (this.uuids.length < 5) this.populate();
		return uuids;
	}
}
