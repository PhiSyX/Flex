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
	sendMessage as sendChannelMessage,
} from "./helpers/channel.js";
import { connectNUsersToChat, connectUsersToChat } from "./helpers/connect.js";
import { generateRandomChannel } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Envoyer /NOTICE à un utilisateur", async ({ browser }) => {
	const channelToJoin = generateRandomChannel();

	const { user1, user2 } = await connectUsersToChat({ browser }, { channels: channelToJoin });

	await sendChannelMessage(user1.page, channelToJoin, `/notice ${user2.nick} Hello World`);
	await containsInChannelMessage(user2.page, channelToJoin, "Hello World");

	await sendChannelMessage(user2.page, channelToJoin, `/notice ${user1.nick} Comment ça va ?`);
	await containsInChannelMessage(user1.page, channelToJoin, "Comment ça va ?");
});

test("Envoyer /NOTICE à un salon", async ({ browser }) => {
	const channelToJoin = generateRandomChannel();

	const [globop, owner, halfop, vip, user] = await connectNUsersToChat(5)(
		{ browser },
		{ channels: channelToJoin },
	);

	await sendChannelMessage(globop.page, channelToJoin, "/oper test-globop test");

	await sendChannelMessage(globop.page, channelToJoin, `/deqop ${channelToJoin} ${globop.nick}`);
	await sendChannelMessage(globop.page, channelToJoin, `/deqop ${channelToJoin} ${halfop.nick}`);
	await sendChannelMessage(globop.page, channelToJoin, `/deqop ${channelToJoin} ${vip.nick}`);
	await sendChannelMessage(globop.page, channelToJoin, `/deqop ${channelToJoin} ${user.nick}`);
	await sendChannelMessage(globop.page, channelToJoin, `/qop ${channelToJoin} ${owner.nick}`);
	await sendChannelMessage(globop.page, channelToJoin, `/op ${channelToJoin} ${globop.nick}`);
	await sendChannelMessage(globop.page, channelToJoin, `/hop ${channelToJoin} ${halfop.nick}`);
	await sendChannelMessage(globop.page, channelToJoin, `/vip ${channelToJoin} ${vip.nick}`);

	// NOTE: NOTICE à tout le salon
	await sendChannelMessage(user.page, channelToJoin, `/notice ${channelToJoin} YO LES GARS`);
	const allContains1 = [user, globop, owner, halfop, vip];
	for (const u of allContains1) {
		await containsInChannelMessage(
			u.page,
			channelToJoin,
			`-${user.nick}:${channelToJoin}- YO LES GARS`,
		);
	}

	// NOTE: NOTICE à tous les opérateurs (%)
	await sendChannelMessage(
		halfop.page,
		channelToJoin,
		`/notice %${channelToJoin} niveau d'accès HalfOperator min`,
	);
	const halfopsAndOperatorsOnly = [globop, owner, halfop];
	const notHalfopsAndOperators = [user, vip];
	for (const u of halfopsAndOperatorsOnly) {
		await containsInChannelMessage(
			u.page,
			channelToJoin,
			`-${halfop.nick}:${channelToJoin}- niveau d'accès HalfOperator min`,
		);
	}
	for (const u of notHalfopsAndOperators) {
		await notContainsInChannelMessage(
			u.page,
			channelToJoin,
			`-${halfop.nick}:${channelToJoin}- niveau d'accès HalfOperator min`,
		);
	}

	// NOTE: NOTICE à tous les opérateurs (@)
	await sendChannelMessage(
		owner.page,
		channelToJoin,
		`/notice @${channelToJoin} niveau d'accès Operator min`,
	);
	const operatorsOnly = [globop, owner];
	const notOperators = [user, vip, halfop];
	for (const u of operatorsOnly) {
		await containsInChannelMessage(
			u.page,
			channelToJoin,
			`-${owner.nick}:${channelToJoin}- niveau d'accès Operator min`,
		);
	}
	for (const u of notOperators) {
		await notContainsInChannelMessage(
			u.page,
			channelToJoin,
			`-${owner.nick}:${channelToJoin}- niveau d'accès Operator min`,
		);
	}
});
