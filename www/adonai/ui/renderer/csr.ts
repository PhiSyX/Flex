// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import type { DefineComponent } from "vue";

import { resolvePageComponent } from "@adonisjs/inertia/helpers";
import { createInertiaApp } from "@inertiajs/vue3";
import { createSSRApp, h } from "vue";

import { use_app, use_layout } from "./app";

const APPLICATION_NAME = import.meta.env.VITE_APP_NAME || "Flex";

createInertiaApp({
	progress: { color: "#5468FF" },

	title(title) {
		return `${title} - ${APPLICATION_NAME}`;
	},

	async resolve(name) {
		let page_component = await resolvePageComponent(
			`../pages/${name}.vue`,
			import.meta.glob<DefineComponent>("../pages/**/*.vue"),
		);
		use_layout(name, page_component);
		return page_component;
	},

	setup({ el, App, props, plugin }) {
		let root_component = {
			render: () => h(App, props),
		};
		let app = use_app(
			// TODO: utiliser `createApp` pour l'application de Chat, car il n'a
			// pas besoin d'être rendu côté serveur.
			createSSRApp(root_component),
			plugin,
		);
		app.mount(el);
		return app;
	},
});
