// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import * as fs from "node:fs/promises";
import * as path from "node:path";

import { type CommonServerOptions, defineConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import yaml from "yaml";

import type { ServerSettings } from "./server.config";

function resolveFromFlex(...paths: Array<string>) {
	return path.resolve("..", "..", "..", ...paths);
}

/**
 * Récupère les paramètres du serveur backend.
 */
async function getFlexServerSettings(): Promise<ServerSettings> {
	const filepath = resolveFromFlex("config", "flex", "server.yml");
	const rawContent = await fs.readFile(filepath);
	const settings = yaml.parse(rawContent.toString("utf8"));
	return settings satisfies ServerSettings;
}

const flexServerSettings = await getFlexServerSettings();

const viteServerHttpsConfig: CommonServerOptions["https"] =
	flexServerSettings.tls && {
		cert: resolveFromFlex(flexServerSettings.tls.cert),
		key: resolveFromFlex(flexServerSettings.tls.key),
	};

// ISSUE(vitejs): Activer l'HTTPS + Proxy rétrograde vers le protocole HTTP/1.
//                Complètement débile.
//
// QUOTE: https://vitejs.dev/config/server-options.html#server-https
//
// > Enable TLS + HTTP/2. Note this downgrades to TLS only when the server.proxy
// > option is also used.
const viteServerUrlProtocol = flexServerSettings.tls ? "https" : "http";
/*
const viteServerProxyConfig: CommonServerOptions["proxy"] = {
	"/api": {
		secure: false,
		target: `${viteServerUrlProtocol}://${flexServerSettings.ip}:${flexServerSettings.port}`,
	},
	"/chat": {
		secure: false,
		target: `${viteServerUrlProtocol}://${flexServerSettings.ip}:${flexServerSettings.port}`
	},
};
*/

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	build: {
		outDir: path.resolve("dist"),
	},
	server: {
		// NOTE: Activer l'HTTPS, active automatiquement le protocole HTTP/2,
		// 		 sauf + proxy, voir le commentaire `ISSUE` ci-haut.
		https: viteServerHttpsConfig,

		// NOTE: Voir le commentaire `ISSUE` ci-haut.
		//proxy: viteServerProxyConfig,

		// NOTE: Voir le commentaire `ISSUE` ci-haut. Ouvre l'URL vers le
		//       serveur backend pour le moment, afin d'éviter de se manger des
		//       erreurs à l'exécution lors des appels XHR (fetch).
		open: `${viteServerUrlProtocol}://localhost:${flexServerSettings.port}/chat`,
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
