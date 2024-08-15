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

import {
	containsMessage,
	selectNickFromUserlist,
	sendMessage,
} from "./helpers/channel.js";
import { connectUsersToChat } from "./helpers/connect.js";
import { generateRandomChannel } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Sanctionner d'un KICK un membre de salon via la commande /KICK", async ({
	browser,
}) => {
	const channelToKick = generateRandomChannel();
	const kickReason = "Dehors !";

	const { user1, user2 } = await connectUsersToChat(
		{ browser },
		{ channels: channelToKick },
	);

	await sendMessage(
		user1.page,
		channelToKick,
		`/kick ${channelToKick} ${user2.nick} ${kickReason}`,
	);

	await containsMessage(
		user1.page,
		channelToKick,
		`* Kicks: ${user2.nick} a été sanctionné par ${user1.nick} (Raison: ${kickReason})`,
	);

	const $kicked = user2.page.locator(".channel\\/kicked");
	await expect($kicked).toContainText(
		`Tu as été sanctionné par ${user1.nick} du salon ${channelToKick} pour la raison suivante « ${kickReason} » !`,
	);
});

test("Sanctionner d'un KICK un membre de salon via le menu de la liste des utilisateurs du salon", async ({
	browser,
}) => {
	const channelToKick = generateRandomChannel();

	const { user1, user2 } = await connectUsersToChat(
		{ browser },
		{ channels: channelToKick },
	);

	const $userlistMenu = await selectNickFromUserlist(
		user1.page,
		channelToKick,
		user2.nick,
	);
	const $kickItem = $userlistMenu.locator("li").getByText("Expulser");
	await $kickItem.click();

	await containsMessage(
		user1.page,
		channelToKick,
		`* Kicks: ${user2.nick} a été sanctionné par ${user1.nick} (Raison: Kick.)`,
	);

	const $kicked = user2.page.locator(".channel\\/kicked");
	await expect($kicked).toContainText(
		`Tu as été sanctionné par ${user1.nick} du salon ${channelToKick} pour la raison suivante « Kick. » !`,
	);
});
