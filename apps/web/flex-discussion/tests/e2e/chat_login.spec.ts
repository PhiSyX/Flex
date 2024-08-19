// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { test } from "@playwright/test";
import { ChatChannelContext } from "./helpers/channel.js";
import { ChatPageContext } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Connexion au Chat", async ({ page }) => {
	let channel_name = ChatChannelContext.generate_name();
	let chat_ctx = await ChatPageContext.connect(page, channel_name);
	await chat_ctx.chan.join();
});

test("Connexion au Chat sans aucun salon, RPL_WELCOME", async ({ page }) => {
	let nickname = ChatPageContext.generate_nick();
	let chat_ctx = await ChatPageContext.connect(page, undefined, nickname);

	await chat_ctx.chan.contains_message(
		`Bienvenue sur le réseau ${nickname}!${nickname}@flex.chat`,
		"Flex",
	);
});
