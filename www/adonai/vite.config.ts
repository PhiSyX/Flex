// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { CommonServerOptions } from "vite";

import { getDirname } from "@adonisjs/core/helpers";
import { resolve } from "node:path";
import { defineConfig } from "vite";

import inertia from "@adonisjs/inertia/client";
import adonisjs from "@adonisjs/vite/client";
import vue from "@vitejs/plugin-vue";

let vite_server_https_config: CommonServerOptions["https"] = {
	cert: resolve("..", "..", "config", "certs", "flex.cer"),
	key: resolve("..", "..", "config", "certs", "flex.pvk"),
};

export default defineConfig({
	plugins: [
		inertia({ ssr: { enabled: true, entrypoint: "ui/renderer/ssr.ts" } }),
		vue(),
		adonisjs({
			entrypoints: ["ui/renderer/csr.ts"],
			reload: ["resources/views/**/*.edge"],
		}),
	],

	cacheDir: "node_modules/.vite_adonis/",
	server: {
		https: vite_server_https_config,
	},

	resolve: {
		alias: {
			"~/": `${getDirname(import.meta.url)}/ui`,
		},
	},
});
