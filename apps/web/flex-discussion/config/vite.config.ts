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
import type { ServerSettings } from "./server.config";

import * as fs from "node:fs/promises";
import * as path from "node:path";

import vue from "@vitejs/plugin-vue";
import { defineConfig as define_config } from "vite";
import yaml from "yaml";

/**
 * Résout les chemins à partir de la racine du projet.
 */
function resolve_paths_from_flex(...paths: Array<string>) {
	return path.resolve("..", "..", "..", ...paths);
}

/**
 * Récupère les paramètres du serveur backend.
 */
async function get_flex_server_settings(): Promise<ServerSettings> {
	let filepath = resolve_paths_from_flex("config", "flex", "server.yml");
	let raw_content = await fs.readFile(filepath);
	let settings = yaml.parse(raw_content.toString("utf8"));
	return settings satisfies ServerSettings;
}

let flex_server_settings = await get_flex_server_settings();

let vite_server_https_config: CommonServerOptions["https"] =
	flex_server_settings.tls && {
		cert: resolve_paths_from_flex(flex_server_settings.tls.cert),
		key: resolve_paths_from_flex(flex_server_settings.tls.key),
	};

// ISSUE(vitejs): Activer l'HTTPS + Proxy rétrograde vers le protocole HTTP/1.
//                Complètement débile.
//
// QUOTE: https://vitejs.dev/config/server-options.html#server-https
//
// > Enable TLS + HTTP/2. Note this downgrades to TLS only when the server.proxy
// > option is also used.
const vite_server_url_protocol = flex_server_settings.tls ? "https" : "http";
/*
const vite_server_proxy_config: CommonServerOptions["proxy"] = {
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

let open_to_browser_url = `${vite_server_url_protocol}://localhost:${flex_server_settings.port}/chat`;

// https://vitejs.dev/config/
export default define_config({
	plugins: [vue()],

	build: {
		outDir: path.resolve("dist"),
	},

	server: {
		// NOTE: Activer l'HTTPS, active automatiquement le protocole HTTP/2,
		// 		 sauf + proxy, voir le commentaire `ISSUE` ci-haut.
		https: vite_server_https_config,

		// NOTE: Voir le commentaire `ISSUE` ci-haut.
		//proxy: vite_server_proxy_config,

		// NOTE: Voir le commentaire `ISSUE` ci-haut. Ouvre l'URL vers le
		//       serveur backend pour le moment, afin d'éviter de se manger des
		//       erreurs à l'exécution lors des appels XHR (fetch).
		open: open_to_browser_url,
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
