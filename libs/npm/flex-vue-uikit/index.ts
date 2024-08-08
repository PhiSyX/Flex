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

import { defineAsyncComponent as define_async_component } from "vue";

// biome-ignore lint/suspicious/noExplicitAny: C'est moche? Je fais ce que je veux.
const icons_imports = import.meta.glob<{ default: any }>(
	"./src/icons/Icon*.vue",
);

let icons_components = Object.entries(icons_imports).map(
	([icon_component_filepath, icon_component]) => {
		let icon_component_name = icon_component_filepath.slice(
			"./src/icons/".length,
			0 - ".vue".length,
		);
		return [icon_component_name, icon_component] as unknown as [
			string,
			// biome-ignore lint/suspicious/noExplicitAny: OSEF
			() => Promise<{ default: any }>,
		];
	},
);

export { default as Alert } from "./src/alert/Alert.vue";
export { default as AudioSound } from "./src/audio-sound/AudioSound.vue";
export { default as Badge } from "./src/badge/Badge.vue";
export { default as Dialog } from "./src/dialog/Dialog.vue";
export { default as UiButton } from "./src/button/Button.vue";
export { default as InputSwitch } from "./src/inputswitch/InputSwitch.vue";
export { default as InputSwitchV2 } from "./src/inputswitch/InputSwitchV2.vue";
export { default as TextInput } from "./src/textinput/TextInput.vue";

export { ButtonIcon, LabelIcon, ICON_NAMES } from "./src/icons";
export type { Icons } from "./src/icons";

// NOTE(phisyx): plugin Vue.
export default {
	install(app: App<Element>)
	{
		for (let [icon_component_name, icon_component] of icons_components) {
			app.component(
				icon_component_name,
				define_async_component(icon_component),
			);
		}
	},
};
