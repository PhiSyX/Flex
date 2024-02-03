// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Locator, type Page, expect, test } from "@playwright/test";
import { containsMessage, sendMessage } from "./helpers/channel.js";
import { connectChat, connectUsersToChat } from "./helpers/connect.js";
import { generateRandomChannel } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

async function partChannel(
	{ page, channel }: { page: Page; channel: string },
	testFn: (_: {
		$navRooms: Locator;
		$navRoomsItems: Locator;
		$channelRoom: Locator;
	}) => Promise<void>,
) {
	const $navRooms = page.locator(".navigation-area .navigation-server ul");
	const $navRoomsItems = $navRooms.locator("li");
	await expect($navRoomsItems).toHaveCount(1);

	const $channelRoom = page.locator(`.room\\/channel[data-room="${channel}"]`);

	await testFn({
		$navRooms,
		$navRoomsItems,
		$channelRoom,
	});

	await expect($navRoomsItems).toHaveCount(0);
	await expect($navRoomsItems).not.toHaveCount(1);
}

test("Partir d'un salon via la commande /PART", async ({ page }) => {
	await page.goto("/");
	const channelToPart = generateRandomChannel();
	await connectChat({ page, channels: channelToPart });
	await partChannel({ page, channel: channelToPart }, () =>
		sendMessage(
			page,
			channelToPart,
			`/part ${channelToPart} Au revoir les amis.`,
		),
	);
});

test("Partir d'un salon via la commande /PART avec un message", async ({
	browser,
}) => {
	const channelToPart = generateRandomChannel();

	const { user1, user2 } = await connectUsersToChat(
		{ browser },
		{ channels: channelToPart },
	);

	await partChannel({ page: user1.page, channel: channelToPart }, () =>
		sendMessage(
			user1.page,
			channelToPart,
			`/part ${channelToPart} Au revoir les amis.`,
		),
	);

	await containsMessage(
		user2.page,
		channelToPart,
		`* Parts: ${user1.nick} (${user1.nick}@F65E28A7.57B2.F6AB) (Au revoir les amis.) `,
	);
});

test("Partir d'un salon via le bouton de fermeture du la navigation", async ({
	page,
}) => {
	await page.goto("/");
	const channelToPart = generateRandomChannel();
	await connectChat({ page, channels: channelToPart });
	await partChannel({ page, channel: channelToPart }, async ({ $navRooms }) => {
		const $navChannelRoom = $navRooms.locator(
			`li[data-room="${channelToPart}"]`,
		);
		await $navChannelRoom.click();

		const $btnCloseChannelRoom = $navChannelRoom.locator(".close");
		await $btnCloseChannelRoom.click();
	});
});

test("Partir d'un salon via le bouton de fermeture du salon", async ({
	page,
}) => {
	await page.goto("/");
	const channelToPart = generateRandomChannel();
	await connectChat({ page, channels: channelToPart });
	await partChannel(
		{ page, channel: channelToPart },
		async ({ $channelRoom }) => {
			const $topicActions = $channelRoom.locator(".room\\/topic\\:action");

			const $btnCloseChannelRoom = $topicActions.locator(".close");
			await $btnCloseChannelRoom.click();
		},
	);
});
