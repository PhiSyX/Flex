// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { defineConfig } from "@adonisjs/core/bodyparser";

const bodyParserConfig = defineConfig({
	allowedMethods: ["POST", "PUT", "PATCH", "DELETE"],

	form: {
		convertEmptyStringsToNull: true,
		types: ["application/x-www-form-urlencoded"],
	},

	json: {
		convertEmptyStringsToNull: true,
		types: [
			"application/json",
			"application/json-patch+json",
			"application/vnd.api+json",
			"application/csp-report",
		],
	},

	multipart: {
		autoProcess: true,
		convertEmptyStringsToNull: true,
		processManually: [],
		limit: "20mb",
		types: ["multipart/form-data"],
	},
});

export default bodyParserConfig;
