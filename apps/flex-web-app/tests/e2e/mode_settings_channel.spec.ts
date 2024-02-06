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
import { connectNUsersToChat } from "./helpers/connect.js";
import { generateRandomChannel } from "./helpers/context.js";
import { containsMessageInActiveRoom, sendMessageInActiveRoom } from "./helpers/room.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Paramètre m: moderate", async ({ browser }) => {
	const channelToJoin = generateRandomChannel();

	const [owner, globop, vip, user] = await connectNUsersToChat(4)(
		{ browser },
		{ channels: channelToJoin },
	);

	await sendMessage(globop.page, channelToJoin, "/oper test-globop test");

	await sendMessage(globop.page, channelToJoin, `/deqop ${channelToJoin} ${globop.nick}`);
	await sendMessage(globop.page, channelToJoin, `/deqop ${channelToJoin} ${vip.nick}`);
	await sendMessage(globop.page, channelToJoin, `/deqop ${channelToJoin} ${user.nick}`);
	await sendMessage(globop.page, channelToJoin, `/qop ${channelToJoin} ${owner.nick}`);
	await sendMessage(globop.page, channelToJoin, `/vip ${channelToJoin} ${vip.nick}`);

	// NOTE: tout le monde peut écrire dans le salon.
	await sendMessage(user.page, channelToJoin, "Hello World #1");
	await containsMessage(user.page, channelToJoin, `Hello World #1`);
	await containsMessage(vip.page, channelToJoin, `Hello World #1`);

	// NOTE: application du mode +m par l'owner
	const $ownerChannelRoom = owner.page.locator(
		`.room\\/channel[data-room="${channelToJoin}"] .room\\/main`,
	);
	await $ownerChannelRoom.dblclick();
	await owner.page.waitForTimeout(250);
	const $ownerTeleport = owner.page.locator("#channel-settings-layer_teleport");
	const $moderateSettings = $ownerTeleport
		.locator("ul li label")
		.getByText("Salon en modéré (+m)");
	await $moderateSettings.click();
	const $ownerBtnSubmit = $ownerTeleport.locator('button[type="submit"]');
	await $ownerBtnSubmit.click();
	await containsMessage(owner.page, channelToJoin, `* ${owner.nick} a défini les modes: +m`);

	await globop.page.waitForTimeout(250);
	await vip.page.waitForTimeout(250);
	await user.page.waitForTimeout(250);

	// NOTE: L'opérateur Globop PEUT envoyer des messages peu importe son
	// niveau d'accès dans le salon.
	await sendMessage(globop.page, channelToJoin, "Hello World #2");
	await containsMessage(owner.page, channelToJoin, `Hello World #2`);
	await containsMessage(globop.page, channelToJoin, `Hello World #2`);
	await containsMessage(vip.page, channelToJoin, `Hello World #2`);
	await containsMessage(user.page, channelToJoin, `Hello World #2`);

	// NOTE: le VIP PEUT envoyer des messages dans le salon.
	await sendMessage(vip.page, channelToJoin, "Hello World #3");
	await containsMessage(vip.page, channelToJoin, `Hello World #3`);
	await containsMessage(owner.page, channelToJoin, `Hello World #3`);
	await containsMessage(globop.page, channelToJoin, `Hello World #3`);
	await containsMessage(user.page, channelToJoin, `Hello World #3`);

	// NOTE: l'utilisateur NE PEUT PAS envoyer de messages dans le salon.
	await sendMessage(user.page, channelToJoin, "Hello World #4");
	await containsMessage(
		user.page,
		channelToJoin,
		`* ${channelToJoin} :Impossible d'envoyer un message au salon`,
	);
	await notContainsMessage(owner.page, channelToJoin, `Hello World #4`);
	await notContainsMessage(globop.page, channelToJoin, `Hello World #4`);
	await notContainsMessage(vip.page, channelToJoin, `Hello World #4`);
});

