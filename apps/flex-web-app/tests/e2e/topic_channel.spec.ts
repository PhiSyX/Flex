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

import { containsMessage, sendMessage } from "./helpers/channel.js";
import { connectUsersToChat } from "./helpers/connect.js";
import { generateRandomChannel } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Changer le sujet d'un salon via la commande /TOPIC", async ({
	browser,
}) => {
	const channelToJoin = generateRandomChannel();
	const topic = "Mon super topic";

	const { user1: owner, user2: user } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	// NOTE: Owner a les droits d'édition. Le premier utilisateur arrivé sur un
	// salon est automatiquement owner du salon.

	await sendMessage(
		owner.page,
		channelToJoin,
		`/topic ${channelToJoin} ${topic}`,
	);

	await containsMessage(
		owner.page,
		channelToJoin,
		`Vous avez mis à jour le sujet du salon ${channelToJoin}: ${topic}`,
	);

	await containsMessage(
		user.page,
		channelToJoin,
		`* Topic: ${owner.nick} a mis à jour le sujet du salon: ${topic}`,
	);

	// NOTE: User, n'a pas les droits d'édition.

	await sendMessage(
		user.page,
		channelToJoin,
		`/topic ${channelToJoin} ${topic}`,
	);

	await containsMessage(
		user.page,
		channelToJoin,
		`* ${channelToJoin} :Vous n'êtes pas opérateur sur ce salon`,
	);
});

test("Changer le sujet d'un salon via le champ d'édition du sujet", async ({
	browser,
}) => {
	const channelToJoin = generateRandomChannel();
	const topic = "Mon super topic";

	const { user1: owner, user2: user } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	const $topicArea = owner.page.locator(".room\\/topic\\:text");
	const $emptyTopic = $topicArea.locator("p");
	await $emptyTopic.dblclick();
	await owner.page.waitForTimeout(250);

	const $inputTopic = $topicArea.locator("input");
	await $inputTopic.fill(topic);
	await $inputTopic.blur();

	await containsMessage(
		owner.page,
		channelToJoin,
		`Vous avez mis à jour le sujet du salon ${channelToJoin}: ${topic}`,
	);

	await containsMessage(
		user.page,
		channelToJoin,
		`* Topic: ${owner.nick} a mis à jour le sujet du salon: ${topic}`,
	);
});
