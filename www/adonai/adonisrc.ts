// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { defineConfig } from "@adonisjs/core/app";

export default defineConfig({
	commands: [
		() => import("@adonisjs/core/commands"),
		() => import("@adonisjs/lucid/commands"),
	],

	providers: [
		() => import("@adonisjs/core/providers/app_provider"),
		() => import("#infrastructure/core/provider/postgres_database"),
		() => import("@adonisjs/core/providers/hash_provider"),
		{
			file: () => import("@adonisjs/core/providers/repl_provider"),
			environment: ["repl", "test"],
		},
		() => import("@adonisjs/core/providers/vinejs_provider"),
		() => import("@adonisjs/core/providers/edge_provider"),
		() => import("@adonisjs/session/session_provider"),
		() => import("@adonisjs/vite/vite_provider"),
		() => import("@adonisjs/shield/shield_provider"),
		() => import("@adonisjs/static/static_provider"),
		() => import("@adonisjs/cors/cors_provider"),
		() => import("@adonisjs/lucid/database_provider"),
		() => import("@adonisjs/auth/auth_provider"),
		() => import("@adonisjs/inertia/inertia_provider"),
		() => import("#infrastructure/auth/provider/auth"),
	],

	preloads: [
		() => import("#start/routes"),
		() => import("#start/kernel"),
		() => import("#start/validator"),
	],

	tests: {
		suites: [
			{
				files: ["tests/unit/**/*.spec(.ts|.js)"],
				name: "unit",
				timeout: 2000,
			},
			{
				files: ["tests/functional/**/*.spec(.ts|.js)"],
				name: "functional",
				timeout: 30000,
			},
		],
		forceExit: false,
	},

	metaFiles: [
		{
			pattern: "templates/views/**/*.edge",
			reloadServer: false,
		},
		{
			pattern: "public/**",
			reloadServer: false,
		},
	],

	assetsBundler: false,
	hooks: {
		onBuildStarting: [() => import("@adonisjs/vite/build_hook")],
	},

	directories: {
		views: "templates/views",
	},
});
