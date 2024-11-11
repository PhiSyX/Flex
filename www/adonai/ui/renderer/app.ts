// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { App, DefineComponent, Plugin } from "vue";

import flex_uikit from "@phisyx/flex-uikit-vue";

import SiteLayout from "../layouts/site.vue";

export function use_app(app: App, plugin: Plugin<[]>) {
	return app.use(plugin).use(flex_uikit);
}

export function use_layout(name: string, /*mut*/ page: DefineComponent) {
	if (!page.default) {
		throw new Error(`La page ${name} ne fournit pas un export par défaut`);
	}

	if (page.default.layout) {
		return;
	}

	switch (name) {
		// TODO: gérer les autres layouts ici
		//
		// Clause par défaut.
		default:
		{
			page.default.layout = SiteLayout;
		} break;
	}
}
