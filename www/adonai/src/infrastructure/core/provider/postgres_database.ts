// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { DB } from "@phisyx/adonai-domain/types/database";

import { Kysely, PostgresDialect } from "kysely";

import app from "@adonisjs/core/services/app";
import logger from "@adonisjs/core/services/logger";
import pg from "pg";

import env from "#start/env";

const { Pool } = pg;

const pool = new Pool({
	host: env.get("DB_HOST"),
	user: env.get("DB_USER"),
	password: env.get("DB_PASSWORD"),
	database: env.get("DB_DATABASE"),
	max: 20,
});
const dialect = new PostgresDialect({ pool });

import type { ApplicationService } from "@adonisjs/core/types";

export default class DatabaseProvider {
	constructor(protected app: ApplicationService) {}

	register() {
		this.app.container.bind(Kysely<DB>, () => {
			return new Kysely<DB>({
				dialect,
				log(event) {
					if (app.inProduction) {
						return;
					}

					if (event.level === "query") {
						const formattedTime = (
							Math.round(event.queryDurationMillis * 100) / 100
						).toFixed(2);

						logger.info(
							`[SQL] ${event.query.sql} - ${formattedTime}ms`,
						);
					}
				},
			});
		});
	}

	async boot() {}

	async start() {}

	async ready() {}

	async shutdown() {}
}
