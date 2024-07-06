// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { View } from "@phisyx/flex-chat";
import { customElement } from "@phisyx/flex-custom-element";
import {
	type HTMLElementExtension,
	div,
	dynview,
	use,
} from "@phisyx/flex-html-element-extension";
import { signal } from "@phisyx/flex-signal";

import scss from "./chat-app.scss?url";

/**
 * Chat App.
 */
@customElement({ mode: "open", styles: [scss] })
export default class ChatApp {
	#view = signal(View.Login);

	render(): HTMLElementExtension {
		return div(
			div(
				dynview(this.#view, (view) => {
					switch (view) {
						case View.Login:
							return use(() => import("../views/login/login-view.ts"));

						case View.DirectAccess:
							{
							}
							break;

						case View.Chat:
							{
							}
							break;

						case View.Settings:
							{
							}
							break;
					}

					return div("hello world");
				}),
			).id("#app"),
		).id("#🆔");
	}
}
