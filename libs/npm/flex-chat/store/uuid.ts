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

export interface ChatStoreUUIDExt {
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

export class UUIDStoreData {
	// ------ //
	// Static //
	// ------ //

	static v4(): UUIDStoreData {
		return new UUIDStoreData(4);
	}

	static v7(): UUIDStoreData {
		return new UUIDStoreData(7);
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		version: UUIDStoreData["version"] = UUID_V7,
		ntimes: UUIDStoreData["ntimes"] = MAX_NTIMES,
	) {
		this.version = version;
		this.ntimes = ntimes;
	}

	// --------- //
	// Propriété //
	// --------- //

	uuids: Array<string> = [];
	version: UUIDVariant;
	ntimes: u8r25;
}

export class UUIDStore {
	// ------ //
	// Static //
	// ------ //

	static readonly IDv4 = "uuidv4-store";
	static readonly IDv7 = "uuidv7-store";

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(private data: UUIDStoreData) {
		this.populate();
	}

	// ------- //
	// Méthode //
	// ------- //

	async populate() {
		let UUID_URL_searchParams = new URLSearchParams();
		UUID_URL_searchParams.set("ntimes", this.data.ntimes.toString());

		let variant = `v${this.data.version}`;
		let queries = UUID_URL_searchParams.toString();

		let generate_UUID_URL = `/generate/uuid/${variant}?${queries}`;

		let response = await fetch(generate_UUID_URL);
		this.data.uuids.push(...(await response.json()));
	}

	take(n?: u8r25): Array<UUID> {
		let ntimes = Number(n) ?? 1;
		let uuids = this.data.uuids.splice(0, ntimes) as Array<UUID>;
		if (this.data.uuids.length < 5) {
			this.populate();
		}
		return uuids;
	}
}
