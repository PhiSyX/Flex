// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import "#/assets/scss/style.scss";

import { createApp } from "vue";

import type { VuePluginInstall } from "./types/vue";

import AppComponent from "./App.vue";

const app = createApp(AppComponent);

// 1. Setup
const plugins = import.meta.glob<{ install: VuePluginInstall }>("./plugins/*.ts", { eager: true });

for (const plugin of Object.values(plugins)) {
	plugin.install(app);
}

// Chargement des composants (events)

// biome-ignore lint/suspicious/noExplicitAny: C'est moche? Je fais ce que je veux.
const eventsComponents = import.meta.glob<{ default: any }>("../sys/room-events/RoomEvent*.vue", {
	eager: true,
});

app.provide(
	"eventsComponents",
	Object.keys(eventsComponents).map((eventFilepath) => {
		const componentName = eventFilepath.slice("../sys/room-events/".length, 0 - ".vue".length);
		return componentName;
	}),
);

for (const [eventFilepath, eventComponent] of Object.entries(eventsComponents)) {
	const componentName = eventFilepath.slice("../sys/room-events/".length, 0 - ".vue".length);
	app.component(componentName, eventComponent.default);
}

// 2. Run
app.mount("#🆔");
