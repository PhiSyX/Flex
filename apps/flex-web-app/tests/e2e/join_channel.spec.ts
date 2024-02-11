// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { type Page, expect, test } from "@playwright/test";

import { containsMessage } from "./helpers/channel.js";
import { connectChat, connectUsersToChat } from "./helpers/connect.js";
import { generateRandomChannel } from "./helpers/context.js";
import { containsMessageInActiveRoom } from "./helpers/room.js";

// See here how to get started:
// https://playwright.dev/docs/intro

async function joinChannel({
	page,
	channels: channel,
	key = "",
}: {
	page: Page;
	channels: string;
	key?: string;
}) {
	const $navServer = page.locator(".navigation-area .navigation-server");
	await expect($navServer).toHaveText("Flex");
	const $formRoom = page.locator("form[action='/msg/flex']");
	const $inputRoom = $formRoom.locator("input[type='text']");
	await $inputRoom.fill(`/join ${channel} ${key}`);
	const $btnSubmit = $formRoom.locator("button[type='submit']");
	await $btnSubmit.click();
}

test("Rejoindre un salon via la commande /JOIN", async ({ page }) => {
	await page.goto("/");
	const channelToJoin = generateRandomChannel();
	await connectChat({ page });
	await joinChannel({ page, channels: channelToJoin });
	await containsMessageInActiveRoom(page, `Vous avez rejoint le salon ${channelToJoin}`);
});

test("Rejoindre un salon avec une clé via la commande /JOIN", async ({ browser }) => {
	const { user1, user2 } = await connectUsersToChat({ browser });

	const channelToJoin = generateRandomChannel();
	const channelToJoinKey = "my-best-key";

	// NOTE: user1 rejoint un salon AVEC une clé
	await joinChannel({
		page: user1.page,
		channels: channelToJoin,
		key: channelToJoinKey,
	});
	await containsMessage(user1.page, channelToJoin, `Vous avez rejoint le salon ${channelToJoin}`);

	// NOTE: user2 rejoint un salon SANS la clé
	await joinChannel({ page: user2.page, channels: channelToJoin });
	await containsMessageInActiveRoom(
		user2.page,
		`* ${channelToJoin} :Vous ne pouvez pas rejoindre le salon (+k)`,
	);

	// NOTE: user2 rejoint un salon AVEC la clé
	await joinChannel({
		page: user2.page,
		channels: channelToJoin,
		key: channelToJoinKey,
	});
	await containsMessage(user2.page, channelToJoin, `Vous avez rejoint le salon ${channelToJoin}`);
});

test("Rejoindre un salon via la boite de dialogue (de la vue ChannelList)", async ({ page }) => {
	await connectChat({ page });

	const $channelListView = page.locator(".navigation-area #goto-channel-list");
	await $channelListView.click();

	const layerName = "channel-join-layer";

	const $btnChannelCreateRequest = page.locator(`#${layerName}_btn`);
	await $btnChannelCreateRequest.click();

	await page.waitForTimeout(250);

	const $teleportChannelCreateRequest = page.locator(`#${layerName}_teleport`);
	const $inputChannels = $teleportChannelCreateRequest.locator("input#channels");

	const channelToJoin = generateRandomChannel();
	await $inputChannels.fill(channelToJoin);

	const $btnSubmit = $teleportChannelCreateRequest.getByText("Rejoindre maintenant");
	await $btnSubmit.click();

	await page.waitForTimeout(250);

	const $mainRoom = page.locator(".room\\/main");
	await expect($mainRoom).toContainText(`Vous avez rejoint le salon ${channelToJoin}`);
});
