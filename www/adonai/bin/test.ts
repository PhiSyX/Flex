// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

process.env.NODE_ENV = "test";

import "reflect-metadata";

import { Ignitor, prettyPrintError } from "@adonisjs/core";
import { configure, processCLIArgs, run } from "@japa/runner";

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
	.testRunner()
	.configure(async (app) => {
		const { runnerHooks, ...config } = await import(
			"../tests/bootstrap.js"
		);

		processCLIArgs(process.argv.splice(2));
		configure({
			...app.rcFile.tests,
			...config,
			...{
				setup: runnerHooks.setup,
				teardown: runnerHooks.teardown.concat([() => app.terminate()]),
			},
		});
	})
	.run(() => run())
	.catch((error) => {
		process.exitCode = 1;
		prettyPrintError(error);
	});
