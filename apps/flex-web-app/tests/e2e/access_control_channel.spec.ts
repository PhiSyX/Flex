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

import { containsMessage, notContainsMessage, sendMessage } from "./helpers/channel.js";
import { connectUsersToChat } from "./helpers/connect.js";
import { generateRandomChannel } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("(Dé)bannissement d'un membre via la commande /BAN ou /UNBAN", async ({ browser }) => {
	const channelToJoin = generateRandomChannel();

	const { user1: owner, user2: user } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	// NOTE: Application du ban user!*@*

	await sendMessage(owner.page, channelToJoin, `/BAN ${channelToJoin} ${user.nick}!*@*`);
	await containsMessage(
		owner.page,
		channelToJoin,
		`* ${owner.nick} a défini les modes: +b ${user.nick}!*@*`,
	);
	await containsMessage(
		user.page,
		channelToJoin,
		`* ${owner.nick} a défini les modes: +b ${user.nick}!*@*`,
	);

	await sendMessage(user.page, channelToJoin, `Hello World`);
	await containsMessage(
		user.page,
		channelToJoin,
		`* ${channelToJoin} :Impossible d'envoyer un message au salon (+b)`,
	);

	// NOTE: Retire le ban
	await sendMessage(owner.page, channelToJoin, `/UNBAN ${channelToJoin} ${user.nick}!*@*`);

	await sendMessage(user.page, channelToJoin, `Hello World #2`);
	await containsMessage(owner.page, channelToJoin, `Hello World #2`);
	await containsMessage(user.page, channelToJoin, `Hello World #2`);
});

test("Ajouter/enlever exception d'un bannissement d'un membre via la commande /BANEX ou /UNBANEX", async ({
	browser,
}) => {
	const channelToJoin = generateRandomChannel();

	const { user1: owner, user2: user } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	// NOTE: Application du ban *!*@* (plus personne ne peut parler à part les modérateurs/opérateurs)

	await sendMessage(owner.page, channelToJoin, `/BAN ${channelToJoin} *!*@*`);
	await containsMessage(
		owner.page,
		channelToJoin,
		`* ${owner.nick} a défini les modes: +b *!*@*`,
	);
	await containsMessage(user.page, channelToJoin, `* ${owner.nick} a défini les modes: +b *!*@*`);

	await sendMessage(user.page, channelToJoin, `Hello World`);
	await containsMessage(
		user.page,
		channelToJoin,
		`* ${channelToJoin} :Impossible d'envoyer un message au salon (+b)`,
	);

	// NOTE: Application de l'exception
	await sendMessage(owner.page, channelToJoin, `/BANEX ${channelToJoin} ${user.nick}!*@*`);
	await sendMessage(user.page, channelToJoin, `Hello World`);
	await containsMessage(owner.page, channelToJoin, `Hello World`);
	await containsMessage(user.page, channelToJoin, `Hello World`);

	// NOTE: Retire l'exception
	await sendMessage(owner.page, channelToJoin, `/UNBANEX ${channelToJoin} ${user.nick}!*@*`);
	await sendMessage(user.page, channelToJoin, `Hello World #2`);
	await notContainsMessage(owner.page, channelToJoin, `Hello World #2`);
	await notContainsMessage(user.page, channelToJoin, `Hello World #2`);
	await containsMessage(
		user.page,
		channelToJoin,
		`* ${channelToJoin} :Impossible d'envoyer un message au salon (+b)`,
	);
});
