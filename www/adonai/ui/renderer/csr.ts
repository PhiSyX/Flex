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

import flex_uikit from "@phisyx/flex-uikit-vue";

const appName = import.meta.env.VITE_APP_NAME || "Flex";

createInertiaApp({
	progress: { color: "#5468FF" },

	title: (title) => `${title} - ${appName}`,

	resolve: (name) => {
		return resolvePageComponent(
			`../pages/${name}.vue`,
			import.meta.glob<DefineComponent>("../pages/**/*.vue"),
		);
	},

	setup({ el, App, props, plugin }) {
		let app = createSSRApp({ render: () => h(App, props) });
		app.use(plugin);
		app.use(flex_uikit);
		app.mount(el);
		return app;
	},
});
