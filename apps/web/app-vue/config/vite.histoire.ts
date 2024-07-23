// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import * as path from "node:path";

import { defineConfig } from "vite";

import vue from "@vitejs/plugin-vue";

function resolveFromFlex(...paths: Array<string>) {
	return path.resolve("..", "..", "..", ...paths);
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	build: {
		outDir: path.resolve("dist"),
	},
	resolve: {
		alias: [
			// Application
			{
				find: /^#/,
				replacement: path.resolve("."),
			},
			{
				find: /^~/,
				replacement: path.resolve("src"),
			},
			// Assets
			{
				find: /^assets:~/,
				replacement: resolveFromFlex("assets"),
			},
			// SCSS Libs
			{
				find: /^scss:~/,
				replacement: resolveFromFlex("libs", "scss"),
			},
		],
	},
});
