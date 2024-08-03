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

import { defineConfig as define_config } from "vite";

import vue from "@vitejs/plugin-vue";

/**
 * Résout les chemins à partir de la racine du projet.
 */
function resolve_paths_from_flex(...paths: Array<string>) {
	return path.resolve("..", "..", "..", ...paths);
}

// https://vitejs.dev/config/
export default define_config({
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
				replacement: resolve_paths_from_flex("assets"),
			},
			// SCSS Libs
			{
				find: /^scss:~/,
				replacement: resolve_paths_from_flex("libs", "scss"),
			},
		],
	},
});
