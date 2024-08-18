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

test("Changer le sujet d'un salon via la commande /TOPIC", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();

	await owner.chan.change_topic("Mon super topic");

	await chat_ctx.timeout(250);
	 
	await user.chan.contains_message((_) => {
		return `* Topic: ${owner.nick} a mis à jour le sujet du salon: Mon super topic`
	});

	// NOTE: User, n'a pas les droits d'édition.
	await user.chan.change_topic("Mon super topic #2", {
		error(chan) {
			return `* ${chan} :Tu n'es pas opérateur sur ce salon`;
		},
	});
});

test("Changer le sujet sans paramètre -t", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();
	await owner.chan.undefine_settings("Seuls les opérateurs peuvent définir un topic (+t)");
	await owner.chan.change_topic("Mon super topic");
	await user.chan.change_topic("Mon super topic #2");
});

test("Changer le sujet d'un salon via le champ d'édition du sujet", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect_many(3, browser);
	let { owner, user } = await chat_ctx.users_with_permissions();
	await owner.chan.change_topic_from_editbox("Mon super topic");
	await user.chan.contains_message(
		`* Topic: ${owner.nick} a mis à jour le sujet du salon: Mon super topic`,
	);
});
