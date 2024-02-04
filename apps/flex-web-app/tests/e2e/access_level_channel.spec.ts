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

import {
	containsMessage,
	selectNickFromUserlist,
	sendMessage,
} from "./helpers/channel.js";
import { connectUsersToChat } from "./helpers/connect.js";
import { generateRandomChannel } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Change les niveaux d'accès d'un membre via les /<commande>'s", async ({
	browser,
}) => {
	const channelToJoin = generateRandomChannel();

	const { user1: owner, user2: user } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	// NOTE: Owner

	const SET = [
		["QOP", "+q"],
		["AOP", "+a"],
		["OP", "+o"],
		["HOP", "+h"],
		["VIP", "+v"],
	];
	for (const [cmd, mode] of SET) {
		await sendMessage(
			owner.page,
			channelToJoin,
			`/${cmd} ${channelToJoin} ${user.nick}`,
		);
		await containsMessage(
			owner.page,
			channelToJoin,
			`* ${owner.nick} a défini les modes: ${mode} ${user.nick}`,
		);
		await containsMessage(
			user.page,
			channelToJoin,
			`* ${owner.nick} a défini les modes: ${mode} ${user.nick}`,
		);
	}

	const UNSET = [
		["DEQOP", "-q"],
		["DEAOP", "-a"],
		["DEOP", "-o"],
		["DEHOP", "-h"],
		["DEVIP", "-v"],
	];
	for (const [cmd, mode] of UNSET) {
		await sendMessage(
			owner.page,
			channelToJoin,
			`/${cmd} ${channelToJoin} ${user.nick}`,
		);
		await containsMessage(
			owner.page,
			channelToJoin,
			`* ${owner.nick} a défini les modes: ${mode} ${user.nick}`,
		);
		await containsMessage(
			user.page,
			channelToJoin,
			`* ${owner.nick} a défini les modes: ${mode} ${user.nick}`,
		);
	}

	// NOTE: User
	await sendMessage(
		user.page,
		channelToJoin,
		`/op ${channelToJoin} ${owner.nick}`,
	);
	await containsMessage(
		user.page,
		channelToJoin,
		`* ${channelToJoin} :Vous n'êtes pas opérateur sur ce salon`,
	);
	await sendMessage(
		user.page,
		channelToJoin,
		`/deop ${channelToJoin} ${owner.nick}`,
	);
	await containsMessage(
		user.page,
		channelToJoin,
		`* ${channelToJoin} :Vous n'êtes pas opérateur sur ce salon`,
	);
});

test("Change les niveaux d'accès d'un membre via le menu de la liste des utilisateurs du salon", async ({
	browser,
}) => {
	const channelToJoin = generateRandomChannel();

	const { user1: owner, user2: user } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	// NOTE: Owner

	const $ownerUserlistMenu = await selectNickFromUserlist(
		owner.page,
		channelToJoin,
		user.nick,
	);

	const SET = ["+q", "+a", "+o", "+h", "+v"];
	for (const mode of SET) {
		const $modeItem = $ownerUserlistMenu.locator("li").getByText(mode);
		await $modeItem.click();
		await containsMessage(
			owner.page,
			channelToJoin,
			`* ${owner.nick} a défini les modes: ${mode} ${user.nick}`,
		);
		await containsMessage(
			user.page,
			channelToJoin,
			`* ${owner.nick} a défini les modes: ${mode} ${user.nick}`,
		);
	}

	const UNSET = ["-q", "-a", "-o", "-h", "-v"];
	for (const mode of UNSET) {
		const $modeItem = $ownerUserlistMenu.locator("li").getByText(mode);
		await $modeItem.click();
		await containsMessage(
			owner.page,
			channelToJoin,
			`* ${owner.nick} a défini les modes: ${mode} ${user.nick}`,
		);

		await containsMessage(
			user.page,
			channelToJoin,
			`* ${owner.nick} a défini les modes: ${mode} ${user.nick}`,
		);
	}
});
