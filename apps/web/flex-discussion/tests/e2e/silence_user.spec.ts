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
import { ChatBrowserContext } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Ignorer un utilisateur (message salon)", async ({ browser }) => {
	let channel = ChatChannelContext.generate_name();
	let chat_ctx = await ChatBrowserContext.connect(browser, channel);	
	let { globop: user1, owner: user2 } = await chat_ctx.users_with_permissions();

	await user1.chan.send_message("Hello World #1");
	await user2.chan.send_message("Hello World #2");

	// NOTE: user2 ignore user1
	await user2.chan.send_message(`/silence +${user1.nick}`);
	await user1.chan.send_message("Hello World #3");
	await user2.chan.not_contains_message("Hello World #3");

	// NOTE: user2 n'ignore plus user1
	await user2.chan.send_message(`/silence -${user1.nick}`);
	await user1.chan.send_message("Hello World #4");
	await user2.chan.contains_message("Hello World #4");
});

test("Ignorer un utilisateur (message privé)", async ({ browser }) => {
	let channel = ChatChannelContext.generate_name();
	let chat_ctx = await ChatBrowserContext.connect(browser, channel);	
	let { globop: user1, owner: user2 } = await chat_ctx.users_with_permissions();

	let $menu = await user1.chan.select_member(user2);
	await $menu.locator("li").getByText("Discuter en privé").click();
	await user1.priv.send(user2, "Hello World", { waiting_list: true });

	// NOTE: user1 ignore user2
	await user1.priv.ignore(user2);
	await user2.priv.send(user1, "Tu reçois mon message?");
	await user1.priv.not_contains_message(user2, "Tu reçois mon message?");

	// NOTE: user1 n'ignore plus user2
	await user1.priv.unignore(user2);
	// NOTE: user2 a déjà accepté le privé de user1 lors du premier envoie
	// pas besoin de placer l'option `{ waiting_list: true }`.
	await user2.priv.send(user1, "Tu reçois mon message? #2");
	await user1.priv.contains_message(user2, "Tu reçois mon message? #2");
});