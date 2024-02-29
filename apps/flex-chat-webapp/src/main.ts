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

import { createApp, defineAsyncComponent } from "vue";

import type { VuePluginInstall } from "#/types/vue";

import AppComponent from "./App.vue";

const app = createApp(AppComponent);

// 1. Setup
const plugins = import.meta.glob<{ install: VuePluginInstall }>("./plugins/*.ts", { eager: true });

for (const plugin of Object.values(plugins)) {
	plugin.install(app);
}

// Chargement des composants (events)

const eventsComponentsImports = import.meta.glob<{ default: unknown }>(
	"../sys/room-events/RoomEvent*.vue",
);

const eventsComponentsEntries = Object.entries(eventsComponentsImports).map(
	([eventFilepath, eventComponent]) => {
		const componentName = eventFilepath.slice("../sys/room-events/".length, 0 - ".vue".length);
		return [componentName, eventComponent] as [string, () => Promise<{ default: unknown }>];
	},
);

app.provide(
	"eventsComponents",
	eventsComponentsEntries.map(([key]) => key),
);

for (const [componentName, eventComponent] of eventsComponentsEntries) {
	app.component(componentName, defineAsyncComponent(eventComponent));
}

// 2. Run
app.mount("#🆔");
