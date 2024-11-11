// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Authenticators, InferAuthEvents } from "@adonisjs/auth/types";
import type { DB } from "@phisyx/adonai-domain/types/database.js";

import { defineConfig } from "@adonisjs/auth";
import { sessionGuard } from "@adonisjs/auth/session";
import { configProvider } from "@adonisjs/core";
import { Kysely } from "kysely";

const authConfig = defineConfig({
	default: "web",
	guards: {
		web: sessionGuard({
			useRememberMeTokens: false,
			provider: configProvider.create(async (app) => {
				let db = await app.container.make(Kysely<DB>);
				const { SessionUserProvider } = await import(
					"#infrastructure/auth/provider/session"
				);
				return new SessionUserProvider(db);
			}),
		}),
	},
});

export default authConfig;

declare module "@adonisjs/auth/types" {
	export interface Authenticators
		extends InferAuthenticators<typeof authConfig> {}
}
declare module "@adonisjs/core/types" {
	interface EventsList extends InferAuthEvents<Authenticators> {}
}
