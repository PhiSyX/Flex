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

import { connectUsersToChat } from "./helpers/connect.js";
import {
	containsMessage,
	sendMessage,
} from "./helpers/channel.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Sanctionner d'un KICK un membre de salon via la commande /KICK", async ({
	browser,
}) => {
	const channelToKick = "#test-kick-command";
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
		`Vous avez été sanctionné par ${user1.nick} du salon ${channelToKick} pour la raison suivante « ${kickReason} » !`,
	);
});

