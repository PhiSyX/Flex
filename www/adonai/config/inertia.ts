// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { InferSharedProps } from "@adonisjs/inertia/types";

import { defineConfig } from "@adonisjs/inertia";
import { AccountSelfOutputDTO } from "@phisyx/adonai-domain/account/dto/self.js";

const inertiaConfig = defineConfig({
	rootView: "inertia_layout",

	sharedData: {
		current_user: (ctx) => AccountSelfOutputDTO.from(ctx.auth.user),
		errors: (ctx) => ctx.session.flashMessages.get("errors"),
	},

	ssr: {
		enabled: true,
		entrypoint: "ui/renderer/ssr.ts",
	},
});

export default inertiaConfig;

declare module "@adonisjs/inertia/types" {
	export interface SharedProps
		extends InferSharedProps<typeof inertiaConfig> {}
}
