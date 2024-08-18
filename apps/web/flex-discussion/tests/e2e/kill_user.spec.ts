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
import { ChatBrowserContext } from "./helpers/context.js";


// See here how to get started:
// https://playwright.dev/docs/intro

test("Sanctionner d'un KILL un utilisateur via la commande /KILL", async ({
	browser,
}) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let kill_reason_message = "Dehors !";
	let { globop, user } = await chat_ctx.users_with_permissions();
	await globop.kill(user, kill_reason_message);
});

test("Sanctionner d'un KILL un utilisateur via la commande /KILL sans permission d'opérateur", async ({
	browser,
	}) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();
	let kill_reason_message = "Dehors !";
	await user.kill(owner, kill_reason_message, {
		error() {
			return "* Permission refusée. Tu n'as pas les privilèges d'opérateur corrects.";
		}
	});
});
