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

test("Envoyer /NOTICE à un utilisateur", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);

	await chat_ctx.first().chan.notice("Hello World #1", {
		target: chat_ctx.second(),
	});
	await chat_ctx.second().chan.notice("Hello World #2", {
		target: chat_ctx.first(),
	});

	// NOTE: Tous les autres utilisateurs ne reçoivent pas les notices envoyées
	// entre deux utilisateurs.
	for (let user of chat_ctx.users()) {
		await user.chan.not_contains_message("Hello World #1");
		await user.chan.not_contains_message("Hello World #2");
	}
});

// FIXME: globop
test("Envoyer /NOTICE à un salon", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect_many(7, browser);
	let { globop, qop, aop, op, hop, vip, user } = await chat_ctx.all_users_with_access_level();

	// NOTE: NOTICE à tout le salon
	await user.chan.notice("YO LES GARS");
	for (let cuser of [globop, qop, aop, op, hop, vip, user]) {
		await cuser.chan.contains_message(
			(chan) => `-${user.nick}:${chan}- YO LES GARS`,
		);
	}

	// NOTE: NOTICE à tous les opérateurs (%)
	await hop.chan.notice("niveau d'accès HalfOperator min", {
		access_level_min: "%",
	});
	for (let cuser of [globop, qop, aop, op, hop]) {
		await cuser.chan.contains_message(
			(chan) => `-${hop.nick}:${chan}- niveau d'accès HalfOperator min`,
		);
	}

	// NOTE: NOTICE à tous les opérateurs (@)
	await op.chan.notice("niveau d'accès Operator min", {
		access_level_min: "@"
	});
	for (let cuser of [globop, qop, aop, op]) {
		await cuser.chan.contains_message(
			(chan) => `-${op.nick}:${chan}- niveau d'accès Operator min`,
		);
	}

	// NOTE: NOTICE à tous les opérateurs (&)
	await aop.chan.notice("niveau d'accès AdminOperator min", {
		access_level_min: "&"
	});
	for (let cuser of [globop, qop, aop]) {
		await cuser.chan.contains_message(
			(chan) => `-${aop.nick}:${chan}- niveau d'accès AdminOperator min`,
		);
	}

	// NOTE: NOTICE à tous les opérateurs (~)
	await qop.chan.notice("niveau d'accès OwnerOperator min", {
		access_level_min: "&"
	});
	for (let cuser of [globop, qop]) {
		await cuser.chan.contains_message(
			(chan) => `-${qop.nick}:${chan}- niveau d'accès OwnerOperator min`,
		);
	}
});
