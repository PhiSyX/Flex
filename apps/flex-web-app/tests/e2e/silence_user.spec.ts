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
	containsMessage as containsInChannelMessage,
	notContainsMessage as notContainsInChannelMessage,
	selectNickFromUserlist,
	sendMessage as sendChannelMessage,
} from "./helpers/channel.js";
import { connectUsersToChat } from "./helpers/connect.js";
import {
	containsMessage as containsInPrivateMessage,
	notContainsMessage as notContainsInPrivateMessage,
	sendMessage as sendPrivateMessage,
} from "./helpers/private.js";
import { openRoomFromNavigation } from "./helpers/room.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Ignorer un utilisateur (message salon)", async ({ browser }) => {
	const channelToJoin = "#test-silence-command";

	const { user1, user2 } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	await sendChannelMessage(user1.page, channelToJoin, "Hello World");
	await containsInChannelMessage(user2.page, channelToJoin, "Hello World");
	await sendChannelMessage(user1.page, channelToJoin, "Comment ça va ?");
	await containsInChannelMessage(user2.page, channelToJoin, "Comment ça va ?");

	// NOTE: user2 ignore user1
	await sendChannelMessage(
		user2.page,
		channelToJoin,
		`/silence +${user1.nick}`,
	);
	await sendChannelMessage(user1.page, channelToJoin, "Super merci ;-)");
	await notContainsInChannelMessage(
		user2.page,
		channelToJoin,
		"Super merci ;-)",
	);

	// NOTE: user2 n'ignore plus user1
	await sendChannelMessage(
		user2.page,
		channelToJoin,
		`/silence -${user1.nick}`,
	);
	await notContainsInChannelMessage(
		user2.page,
		channelToJoin,
		"Super merci ;-)",
	);
	await sendChannelMessage(
		user1.page,
		channelToJoin,
		"Je ne vois pas de quoi tu parles",
	);
	await containsInChannelMessage(
		user2.page,
		channelToJoin,
		"Je ne vois pas de quoi tu parles",
	);
});

test("Ignorer un utilisateur (message privé)", async ({ browser }) => {
	const { user1, user2 } = await connectUsersToChat(
		{ browser },
		{ channels: "#test-silence-command" },
	);

	const $userlistMenu = await selectNickFromUserlist(
		user1.page,
		"#test-silence-command",
		user2.nick,
	);

	await $userlistMenu.locator("li").getByText("Discuter en privé").click();
	await sendPrivateMessage(user1.page, user2.nick, "Hello World");
	const [_, $privateRoom] = await openRoomFromNavigation(
		user2.page,
		user1.nick,
	);
	await containsInPrivateMessage(
		user2.page,
		user1.nick,
		`${user1.nick} :Hello World`,
	);
	await sendPrivateMessage(user1.page, user2.nick, "Comment ça va ?");
	await containsInPrivateMessage(
		user2.page,
		user1.nick,
		`${user1.nick} :Comment ça va ?`,
	);

	// NOTE: user2 ignore user1
	const $btnIgnore = $privateRoom.getByTitle(`Ignorer ${user1.nick}`);
	await $btnIgnore.click();
	await sendPrivateMessage(user1.page, user2.nick, "Super merci ;-)");
	await notContainsInPrivateMessage(
		user2.page,
		user1.nick,
		`${user1.nick} :Super merci ;-)`,
	);
	await sendPrivateMessage(user1.page, user2.nick, "????");
	await notContainsInPrivateMessage(
		user2.page,
		user1.nick,
		`${user1.nick} :????`,
	);

	// NOTE: user2 n'ignore plus user1
	const $btnUnignore = $privateRoom.getByTitle(`Ne plus ignorer ${user1.nick}`);
	await $btnUnignore.click();
	await sendPrivateMessage(
		user1.page,
		user2.nick,
		"Je ne vois pas de quoi tu parles",
	);
	await containsInPrivateMessage(
		user2.page,
		user1.nick,
		`${user1.nick} :Je ne vois pas de quoi tu parles`,
	);
});
