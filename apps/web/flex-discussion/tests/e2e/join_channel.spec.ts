// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { expect, test } from "@playwright/test";

import { ChatChannelContext } from "./helpers/channel.js";
import { ChatBrowserContext, ChatPageContext } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Rejoindre un salon via la commande /JOIN", async ({ page }) => {
	let chat_ctx = await ChatPageContext.connect(page);
	await chat_ctx.chan.join();
});

test("Rejoindre un salon avec une clé via la commande /JOIN", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	
	let channel_name = ChatChannelContext.generate_name();
	// NOTE: `user1` rejoint un salon AVEC une clé
	await chat_ctx.first().chan.join(channel_name, { key: "good-key" });

	// NOTE: `user2` tente de rejoin SANS une clé 
	await chat_ctx.second().chan.join(channel_name, {
		error(channel) {
			return `* ${channel} :Tu ne peux pas rejoindre le salon (+k)`
		},
	});
	// NOTE: `user2` rejoint une clé incorrecte
	await chat_ctx.second().chan.join(channel_name, {
		key: "wrong-key",
		error(channel) {
			return `* ${channel} :Tu ne peux pas rejoindre le salon (+k)`;
		},
	});
	// NOTE: `user2` rejoint un salon AVEC la bonne clé
	await chat_ctx.second().chan.join(channel_name, { key: "good-key" });
});

test("Rejoindre un salon via la boite de dialogue (de la vue ChannelList)", async ({ page }) => {
	let chat_ctx = await ChatPageContext.connect(page);
	await chat_ctx.chan.join_using_dialog();
});

test("Rejoindre un salon via la commande /SAJOIN (globop)", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { globop, owner, user } = await chat_ctx.users_with_permissions();
	let to_force_join_channel_name = ChatChannelContext.generate_name();
	// NOTE: L'owner n'est pas un opérateur GLOBAL.
	await owner.chan.sajoin(
		to_force_join_channel_name,
		user,
		{ with_permission: false },
	);
	// NOTE: `user` n'a évidemment pas rejoint ce salon, après le fail.
	let $nav = user.page.locator(".navigation-area .navigation-server ul li");
	await expect($nav).toHaveCount(1);
	await globop.chan.sajoin(to_force_join_channel_name, user);
	await expect($nav).toHaveCount(2);
});
