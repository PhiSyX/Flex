// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { App, defineAsyncComponent } from "vue";

// biome-ignore lint/suspicious/noExplicitAny: C'est moche? Je fais ce que je veux.
const iconsImports = import.meta.glob<{ default: any }>("./src/icons/Icon*.vue");

const iconsComponents = Object.entries(iconsImports).map(
	([iconComponentFilepath, iconComponent]) => {
		const iconComponentName = iconComponentFilepath.slice(
			"./src/icons/".length,
			0 - ".vue".length,
		);
		return [iconComponentName, iconComponent] as unknown as [
			string,
			// biome-ignore lint/suspicious/noExplicitAny: OSEF
			() => Promise<{ default: any }>,
		];
	},
);

export { default as Alert } from "./src/alert/Alert.vue";
export { default as Badge } from "./src/badge/Badge.vue";
export { default as Dialog } from "./src/dialog/Dialog.vue";
export { default as UiButton } from "./src/button/Button.vue";
export { default as InputSwitch } from "./src/input-switch/InputSwitch.vue";
export { default as InputSwitchV2 } from "./src/input-switch/InputSwitchV2.vue";
export { default as TextInput } from "./src/text-input/TextInput.vue";

export { ButtonIcon, LabelIcon } from "./src/icons";
export type { Icons } from "./src/icons";

// NOTE(phisyx): plugin Vue.
export default {
	install(app: App<Element>) {
		for (const [iconComponentName, iconComponent] of iconsComponents) {
			app.component(iconComponentName, defineAsyncComponent(iconComponent));
		}
	},
};
