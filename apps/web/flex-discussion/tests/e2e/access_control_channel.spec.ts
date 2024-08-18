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

test("(Dé)bannissement d'un membre via la commande /BAN ou /UNBAN", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();

	// NOTE: Application du ban user!*@*
	await owner.chan.bannick(user);
	await user.chan.send_message("Hello World", {
		error(chan) {
			return `* ${chan} :Impossible d'envoyer un message au salon (+b)`;
		},
	});

	// NOTE: Retire le ban sur user!*@*
	await owner.chan.unbannick(user);
	await user.chan.send_message("Hello World #2");

	await owner.chan.contains_message("Hello World #2");
	await user.chan.contains_message("Hello World #2");
});

test(
	"Ajouter/enlever exception d'un bannissement d'un membre via " +
	"la commande /BANEX ou /UNBANEX", 
async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();

	// NOTE: Application du ban *!*@* (plus personne ne peut parler à part les modérateurs/opérateurs)

	await owner.chan.banall();

	await user.chan.send_message("Hello World", {
		error(chan) {
			return `* ${chan} :Impossible d'envoyer un message au salon (+b)`;
		},
	});

	// NOTE: Application de l'exception
	await owner.chan.banexcept(`${user.nick}!*@*`);
	await user.chan.send_message("Hello World #2");
	await owner.chan.contains_message("Hello World #2");

	// NOTE: Retire l'exception
	await owner.chan.unbanexcept(`${user.nick}!*@*`);
	await user.chan.send_message("Hello World #3", {
		error(channel) {
			return `* ${channel} :Impossible d'envoyer un message au salon (+b)`;
		},
	});
	await owner.chan.not_contains_message("Hello World #3");
	await user.chan.not_contains_message("Hello World #3");
});
