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

import {
	createApp as create_app,
	defineAsyncComponent as define_async_component,
} from "vue";

import AppComponent from "./App.vue";

const app = create_app(AppComponent);

// 1. Setup
const plugins = import.meta.glob<{ install: VuePluginInstall }>(
	"./plugins/*.ts",
	{ eager: true },
);

for (const plugin of Object.values(plugins)) {
	plugin.install(app);
}

// Chargement des composants (events)

const events_components_imports = import.meta.glob<{ default: unknown }>(
	"../sys/room_events/RoomEvent*.vue",
);

const events_components_entries = Object.entries(events_components_imports).map(
	([eventFilepath, eventComponent]) => {
		const componentName = eventFilepath.slice(
			"../sys/room_events/".length,
			0 - ".vue".length,
		);
		return [componentName, eventComponent] as [
			string,
			() => Promise<{ default: unknown }>,
		];
	},
);

app.provide(
	"events_components",
	events_components_entries.map(([key]) => key),
);

for (const [component_name, event_component] of events_components_entries) {
	app.component(component_name, define_async_component(event_component));
}

// 2. Run
app.mount("#🆔");
