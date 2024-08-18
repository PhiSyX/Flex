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

test("Paramètre m: moderate", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect_many(4, browser);

	let { globop, owner, user } = await chat_ctx.users_with_permissions();
	let vip = chat_ctx.last();

	await globop.chan.send_message((c) => `/deqop ${c} ${globop.nick}`);
	await globop.chan.send_message((c) => `/deqop ${c} ${vip.nick}`);
	await globop.chan.send_message((c) => `/deqop ${c} ${user.nick}`);
	await globop.chan.send_message((c) => `/qop ${c} ${owner.nick}`);
	await globop.chan.send_message((c) => `/vip ${c} ${vip.nick}`);

	// NOTE: Par défaut, tout le monde peut écrire dans le salon.
	await user.chan.send_message("Hello World #1");
	await user.chan.contains_message("Hello World #1");
	await vip.chan.contains_message("Hello World #1");

	// NOTE: application du mode +m par l'owner
	await owner.chan.define_settings("Salon en modéré (+m)");

	// NOTE: l'opérateur Globop PEUT envoyer des messages peu importe son
	// niveau d'accès dans le salon.
	await globop.chan.send_message("Hello World #2");
	for (let ctx_user of chat_ctx.all_users()) {
		await ctx_user.chan.contains_message("Hello World #2");
	}

	// NOTE: le VIP PEUT envoyer des messages dans le salon.
	await vip.chan.send_message("Hello World #3");
	for (let ctx_user of chat_ctx.all_users()) {
		await ctx_user.chan.contains_message("Hello World #3");
	}

	// NOTE: l'utilisateur NE PEUT PAS envoyer de messages dans le salon.
	await user.chan.send_message("Hello World #4", {
		error(channel) {
			return `* ${channel} :Impossible d'envoyer un message au salon`;
		}
	});
	for (let ctx_user of chat_ctx.all_users()) {
		await ctx_user.chan.not_contains_message("Hello World #4");
	}
});

test("Paramètre n: no external messages", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);

	let { globop, owner, user } = await chat_ctx.users_with_permissions();

	// NOTE: Par défaut, le paramètre de salon +n est automatiquement définit.

	// NOTE: globop quitte le salon et envoie un message au salon en +n
	await globop.chan.part();
	await globop.chan.send_message((_, chan) => `/pubmsg ${chan} Hello World #1`, { from: "Flex" });
	
	let message1 = new RegExp(`\(extern\).*-.*${globop.nick}.*-.*Hello World #1`);
	await owner.chan.contains_message(message1);

	// NOTE: User ne peut pas envoyer de message s'il n'est pas présent dans le
	// salon.
	await user.chan.part();
	await user.chan.send_message((_, chan) => `/pubmsg ${chan} Hello World #2`, {
		from: "Flex",
		error(_, chan) {
			return `* ${chan} :Impossible d'envoyer un message au salon`;
		},
	});

	// NOTE: Owner change le paramètre en -n.
	await owner.chan.undefine_settings("Pas de messages à partir de l'extérieur (+n)");

	// NOTE: User PEUT désormais envoyer de message s'il n'est pas présent dans
	// le salon.
	await user.chan.send_message((_, chan) => `/pubmsg ${chan} Hello World #3`, {
		from: "Flex",
	});
	let message2 = new RegExp(`\(extern\).*-.*${user.nick}.*-.*Hello World #3`);
	await owner.chan.contains_message(message2);
});
