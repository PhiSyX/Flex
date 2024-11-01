// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import "reflect-metadata";

import { Ignitor, prettyPrintError } from "@adonisjs/core";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const APP_ROOT = new URL("../", import.meta.url);

function importer(filePath: string) {
	if (filePath.startsWith("./") || filePath.startsWith("../")) {
		return import(new URL(filePath, APP_ROOT).href);
	}
	return import(filePath);
}

new Ignitor(APP_ROOT, { importer })
	.tap((app) => {
		app.booting(async () => {
			await import("#start/env");
		});
		app.listen("SIGTERM", () => app.terminate());
		app.listenIf(app.managedByPm2, "SIGINT", () => app.terminate());
	})
	.httpServer({
		https: 2,
		cert: readFileSync(resolve("..", "..", "config", "certs", "flex.cer")),
		key: readFileSync(resolve("..", "..", "config", "certs", "flex.pvk")),
	})
	.start()
	.catch((error) => {
		process.exitCode = 1;
		prettyPrintError(error);
	});
