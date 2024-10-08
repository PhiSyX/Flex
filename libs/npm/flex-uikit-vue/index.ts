// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { App } from "vue";

import { defineAsyncComponent } from "vue";

// @ts-expect-error Vite glob
// biome-ignore lint/suspicious/noExplicitAny: C'est moche? Je fais ce que je veux.
const icons_imports = import.meta.glob<{ default: any }>("./icons/Icon*.vue");

let icons_components = Object.entries(icons_imports).map(
	([icon_component_filepath, icon_component]) => {
		let icon_component_name = icon_component_filepath.slice(
			"./icons/".length,
			0 - ".vue".length,
		);
		return [icon_component_name, icon_component] as unknown as [
			string,
			// biome-ignore lint/suspicious/noExplicitAny: OSEF
			() => Promise<{ default: any }>,
		];
	},
);

// NOTE(phisyx): plugin Vue.
export default {
	install(app: App<Element>) {
		for (let [icon_component_name, icon_component] of icons_components) {
			app.component(
				icon_component_name,
				defineAsyncComponent(icon_component),
			);
		}
	},
};
