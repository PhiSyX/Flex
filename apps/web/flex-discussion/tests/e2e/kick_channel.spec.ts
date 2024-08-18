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

test("Sanctionner d'un KICK un membre de salon via la commande /KICK", async ({
	browser,
}) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();
	await owner.chan.kick(user, "Dehors !");
});

test(
	"Sanctionner d'un KICK un membre de salon via le menu de la liste des " +
	"utilisateurs du salon",
	async ({ browser }) => {
		let chat_ctx = await ChatBrowserContext.connect(browser);
		let { owner, user } = await chat_ctx.users_with_permissions();
		await owner.chan.kick_using_menu(user, "Kick.");
	}
);

test("Sanctionner d'un KICK par un opérateur global (globop)", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { globop, owner, user } = await chat_ctx.users_with_permissions();
	await owner.chan.kick(user, "Dehors !");
	await owner.chan.kick(globop, "Toi aussi dehors !", {
		error(chan) {
			return `* ${chan} ${globop.nick} `
				+ ":Tu n'as pas le droit de sanctionner d'un KICK cet "
				+ "utilisateur (protégé par le drapeau +q)";
		},
	});
	await owner.chan.kick_using_menu(globop, "Kick.", {
		error(chan) {
			return `* ${chan} ${globop.nick} `
				+ ":Tu n'as pas le droit de sanctionner d'un KICK cet "
				+ "utilisateur (protégé par le drapeau +q)";
		},
	});

	await globop.chan.kick(owner, "C'est toi qui ira dehors puisque j'ai tous les droits");
});