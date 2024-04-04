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

async function getFlexServerSettings(): Promise<ServerSettings>
{
	const filepath = path.resolve("..", "..", "config", "flex", "server.yml");
	const content = await fs.readFile(filepath);
	const serverSettingsObject = yaml.parse(content.toString("utf8"));
	return serverSettingsObject satisfies ServerSettings;
}

const flexServerSettings = await getFlexServerSettings();

const viteServerHttpsConfig: CommonServerOptions["https"] = flexServerSettings.tls && {
	cert: path.resolve("..", "..", flexServerSettings.tls.cert),
	key: path.resolve("..", "..", flexServerSettings.tls.key),
};
const viteServerProxyProtocol = flexServerSettings.tls ? "https" : "http";
const viteServerProxyConfig: CommonServerOptions["proxy"] = {
	"/api": {
		secure: false,
		target: `${viteServerProxyProtocol}://${flexServerSettings.ip}:${flexServerSettings.port}`,
	},
	"/chat": {
		secure: false,
		target: `${viteServerProxyProtocol}://${flexServerSettings.ip}:${flexServerSettings.port}`
	},
};

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	build: {
		outDir: path.resolve("dist"),
	},
	server: {
		https: viteServerHttpsConfig,
		proxy: viteServerProxyConfig,
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
			// SCSS Libs
			{
				find: /^scss:~/,
				replacement: path.resolve("..", "..", "libs", "scss"),
			},
		],
	},
});
