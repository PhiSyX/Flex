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

test("Invite un utilisateur dans un salon via la commande /INVITE", async ({ browser }) => {
	const channelToJoin = generateRandomChannel();

	const { user1, user2 } = await connectUsersToChat({ browser }, { channels: channelToJoin });

	const channelToInvite = generateRandomChannel();

	await sendMessage(user1.page, channelToJoin, `/join ${channelToInvite}`);
	await sendMessage(user1.page, channelToInvite, `/invite ${user2.nick} ${channelToInvite}`);

	await containsMessage(
		user2.page,
		channelToJoin,
		`${user2.nick} a été invité à rejoindre le salon ${channelToInvite}`,
	);
	await sendMessage(user2.page, channelToJoin, `/join ${channelToInvite}`);
	await containsMessage(
		user2.page,
		channelToInvite,
		`Vous avez rejoint le salon ${channelToInvite}`,
	);
});

test("Paramètre de salon +i", async ({ browser }) => {
	const channelToJoin = generateRandomChannel();
	const layerName = "channel-settings-layer";

	const { user1: owner, user2: user } = await connectUsersToChat(
		{ browser },
		{ channels: channelToJoin },
	);

	const channelToInvite = generateRandomChannel();

	await sendMessage(owner.page, channelToJoin, `/join ${channelToInvite}`);

	// NOTE: application du drapeau -i invite_only par le propriétaire,
	// l'utilisateur n'a pas le droit de rejoindre le salon.
	const $ownerChannelRoom = owner.page.locator(
		`.room\\/channel[data-room="${channelToInvite}"] .room\\/main`,
	);
	await $ownerChannelRoom.dblclick();
	await owner.page.waitForTimeout(250);
	const $ownerTeleport = owner.page.locator(`#${layerName}_teleport`);
	const $inviteOnlySettings = $ownerTeleport
		.locator("ul li label")
		.getByText("Salon accessible sur invitation uniquement (+i)");
	await $inviteOnlySettings.click();
	const $ownerBtnSubmit = $ownerTeleport.locator('button[type="submit"]');
	await $ownerBtnSubmit.click();
	await containsMessage(owner.page, channelToInvite, `* ${owner.nick} a défini les modes: +i`);

	// NOTE: Utilisateur tente de joindre le salon
	await sendMessage(user.page, channelToJoin, `/join ${channelToInvite}`);
	await containsMessage(
		user.page,
		channelToJoin,
		`* ${channelToInvite} :Vous ne pouvez pas rejoindre le salon (+i)`,
	);

	// NOTE: le propriétaire invite l'utilisateur
	await sendMessage(owner.page, channelToInvite, `/invite ${user.nick} ${channelToInvite}`);
	await containsMessage(
		user.page,
		channelToJoin,
		`${user.nick} a été invité à rejoindre le salon ${channelToInvite}`,
	);
	await sendMessage(user.page, channelToJoin, `/join ${channelToInvite}`);
	await containsMessage(
		user.page,
		channelToInvite,
		`Vous avez rejoint le salon ${channelToInvite}`,
	);
});
