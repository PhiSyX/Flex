// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { App } from "vue";

// biome-ignore lint/suspicious/noExplicitAny: C'est moche? Je fais ce que je veux.
const iconsImports = import.meta.glob<{ default: any }>(
	"./src/icons/Icon*.vue",
	{ eager: true },
);

const iconsComponents = Object.entries(iconsImports).map(
	([iconComponentFilepath, iconComponent]) => {
		const iconComponentName = iconComponentFilepath.slice(
			"./src/icons/".length,
			0 - ".vue".length,
		);
		return [iconComponentName, iconComponent.default];
	},
);

export { default as InputSwitch } from "./src/input-switch/InputSwitch.vue";
export { default as TextInput } from "./src/text-input/TextInput.vue";

export { ButtonIcon, LabelIcon } from "./src/icons";
export type { Icons } from "./src/icons";

// NOTE(phisyx): plugin Vue.
export default {
	install(app: App<Element>) {
		for (const [iconComponentName, iconComponent] of iconsComponents) {
			app.component(iconComponentName, iconComponent);
		}
	},
};
