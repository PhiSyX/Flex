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

test("Partir d'un salon via la commande /PART avec un message", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();
	await owner.chan.part("Au revoir les amis.");
	await user.chan.contains_message(
		`* Parts: ${owner.nick} (${owner.nick}@flex.chat) (Au revoir les amis.)`
	);
});

test("Partir d'un salon via le bouton de fermeture du la navigation", async ({ browser }) => {
	let channel = ChatChannelContext.generate_name();
	let chat_ctx = await ChatBrowserContext.connect(browser, channel);
	await chat_ctx.first().chan.close_from_nav();
	await chat_ctx.timeout(1000);
	await chat_ctx.second().chan.contains_message(
		`* Parts: ${chat_ctx.first().nick} (${chat_ctx.first().nick}@flex.chat)`
	);
});

test("Partir d'un salon via le bouton de fermeture du salon", async ({ browser }) => {
	let channel = ChatChannelContext.generate_name();
	let chat_ctx = await ChatBrowserContext.connect(browser, channel);
	await chat_ctx.first().chan.close_from_room();
	await chat_ctx.timeout(1000);
	await chat_ctx.second().chan.contains_message(
		`* Parts: ${chat_ctx.first().nick} (${chat_ctx.first().nick}@flex.chat)`
	);
});

test("Partir d'un salon via la commande /SAPART (globop)", async ({ browser }) => {
	let channel = ChatChannelContext.generate_name();
	let chat_ctx = await ChatBrowserContext.connect(browser, channel);	
	let { globop, owner } = await chat_ctx.users_with_permissions();

	// NOTE: owner n'est pas un opérateur global.
	await owner.chan.sapart(channel, globop, { with_permission: false });

	// NOTE: globop est opérateur global.
	await globop.chan.sapart(channel, owner);
	await globop.chan.contains_message(
		`* Parts: ${owner.nick} (${owner.nick}@flex.chat)`
	);
});
