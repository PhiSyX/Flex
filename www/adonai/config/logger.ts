// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import env from "#start/env";
import app from "@adonisjs/core/services/app";

import { defineConfig, targets } from "@adonisjs/core/logger";

const loggerConfig = defineConfig({
	default: "app",

	loggers: {
		app: {
			enabled: true,
			name: env.get("APP_NAME"),
			level: env.get("LOG_LEVEL"),
			transport: {
				targets: targets()
					.pushIf(!app.inProduction, targets.pretty())
					.pushIf(app.inProduction, targets.file({ destination: 1 }))
					.toArray(),
			},
		},
	},
});

export default loggerConfig;

declare module "@adonisjs/core/types" {
	export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
