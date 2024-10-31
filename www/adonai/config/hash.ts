// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { defineConfig, drivers } from "@adonisjs/core/hash";

const hashConfig = defineConfig({
	default: "argon2",

	list: {
		argon2: drivers.argon2({
			variant: "id",
			version: 0x13,
			iterations: 3,
			parallelism: 4,
			memory: 1 << 16,
			saltSize: 1 << 4,
			hashLength: 2 << 4,
		}),

		scrypt: drivers.scrypt({
			cost: 64 << 8,
			blockSize: 8,
			parallelization: 1,
			maxMemory: 33554432,
		}),
	},
});

export default hashConfig;

declare module "@adonisjs/core/types" {
	export interface HashersList extends InferHashers<typeof hashConfig> {}
}
