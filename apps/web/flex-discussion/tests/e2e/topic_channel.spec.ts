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

test("Changer le sujet d'un salon via la commande /TOPIC", async ({ browser }) => {
	const channelToJoin = generateRandomChannel();
	const layerName = "channel-settings-layer";
	const topic = "Mon super topic";

	const { user1: owner, user2: user } = await connectUsersToChat(
		{ browser },
		// NOTE: le salon a comme drapeau +t dès la création du salon.
		{ channels: channelToJoin },
	);

	// NOTE: Owner a les droits d'édition. Le premier utilisateur arrivé sur un
	// salon est automatiquement owner du salon.

	await sendMessage(owner.page, channelToJoin, `/topic ${channelToJoin} ${topic}`);

	await containsMessage(
		owner.page,
		channelToJoin,
		`Tu as mis à jour le sujet du salon ${channelToJoin}: ${topic}`,
	);

	await containsMessage(
		user.page,
		channelToJoin,
		`* Topic: ${owner.nick} a mis à jour le sujet du salon: ${topic}`,
	);

	// NOTE: User, n'a pas les droits d'édition.

	await sendMessage(user.page, channelToJoin, `/topic ${channelToJoin} ${topic} #2`);

	await containsMessage(
		user.page,
		channelToJoin,
		`* ${channelToJoin} :Tu n'es pas opérateur sur ce salon`,
	);

	// NOTE: retrait du drapeau -t topic, l'utilisateur a les droits d'édition.
	const $ownerChannelRoom = owner.page.locator(
		`.room\\/channel[data-room="${channelToJoin}"] .room\\/main`,
	);
	await $ownerChannelRoom.dblclick();
	await owner.page.waitForTimeout(250);
	const $ownerTeleport = owner.page.locator(`#${layerName}_teleport`);
	const $topicSettings = $ownerTeleport
		.locator("ul li label")
		.getByText("Seuls les opérateurs peuvent définir un topic (+t)");
	await $topicSettings.click();
	const $ownerBtnSubmit = $ownerTeleport.locator('button[type="submit"]');
	await $ownerBtnSubmit.click();
	await containsMessage(owner.page, channelToJoin, `* ${owner.nick} a défini les modes: -t`);

	await sendMessage(user.page, channelToJoin, `/topic ${channelToJoin} ${topic} #2`);
	await containsMessage(
		user.page,
		channelToJoin,
		`Tu as mis à jour le sujet du salon ${channelToJoin}: ${topic} #2`,
	);
	await containsMessage(
		owner.page,
		channelToJoin,
		`* Topic: ${user.nick} a mis à jour le sujet du salon: ${topic} #2`,
	);
});

test("Changer le sujet d'un salon via le champ d'édition du sujet", async ({ browser }) => {
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
		`Tu as mis à jour le sujet du salon ${channelToJoin}: ${topic}`,
	);

	await containsMessage(
		user.page,
		channelToJoin,
		`* Topic: ${owner.nick} a mis à jour le sujet du salon: ${topic}`,
	);
});
