// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { DefineComponent } from "vue";

import { createInertiaApp } from "@inertiajs/vue3";
import { renderToString } from "@vue/server-renderer";
import { createSSRApp, h } from "vue";

import { use_app, use_layout } from "./app";

// biome-ignore lint/suspicious/noExplicitAny: adonisjs - @inertiajs/vue
export default function render(page: any) {
	return createInertiaApp({
		page,
		render: renderToString,

		resolve(name) {
			let pages = import.meta.glob<DefineComponent>("../pages/**/*.vue", {
				eager: true,
			});
			let page_component = pages[`../pages/${name}.vue`];
			use_layout(name, page_component);
			return page_component;
		},

		setup({ App, props, plugin }) {
			let root_component = {
				render: () => h(App, props),
			};
			let app = use_app(createSSRApp(root_component), plugin);
			return app;
		},
	});
}
