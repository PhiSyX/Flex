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

import { containsMessage, sendMessage } from "./helpers/channel.js";
import { connectUsersToChat } from "./helpers/connect.js";
import { generateRandomChannel } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Sanctionner d'un KILL un utilisateur via la commande /KILL", async ({
	browser,
}) => {
	const channelToJoin = generateRandomChannel();
	const killReason = "Dehors !";
	// FIXME: améliorer le message du quit.
	const quitReason = "socket was forcefully disconnected from the namespace";

	const { user1, user2 } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	await sendMessage(user1.page, channelToJoin, "/oper test-globop test");

	await user1.page.waitForTimeout(250);

	await sendMessage(
		user1.page,
		channelToJoin,
		`/kill ${user2.nick} ${killReason}`,
	);

	await containsMessage(
		user1.page,
		channelToJoin,
		`* Quits: ${user2.nick} (${user2.nick}@flex.chat) (${quitReason})`,
	);

	const $teleportErrorKill = user2.page.locator("#error-layer_teleport");

	await expect($teleportErrorKill).toContainText(
		`Déconnexion: tu as été sanctionné d'un KILL par ${user1.nick} (${killReason})`,
	);
});

test("Sanctionner d'un KILL un utilisateur via la commande /KILL sans permission d'opérateur", async ({
	browser,
}) => {
	const channelToJoin = generateRandomChannel();
	const killReason = "Dehors !";
	// FIXME: améliorer le message du quit.
	const quitReason = "socket was forcefully disconnected from the namespace";

	const { user1, user2 } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	await user1.page.waitForTimeout(250);

	await sendMessage(
		user1.page,
		channelToJoin,
		`/kill ${user2.nick} ${killReason}`,
	);

	await containsMessage(
		user1.page,
		channelToJoin,
		"* Permission refusée. tu n'as pas les privilèges d'opérateur corrects.",
	);
});
