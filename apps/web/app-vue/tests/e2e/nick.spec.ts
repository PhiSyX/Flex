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
import { connectChat } from "./helpers/connect.js";
import { generateRandomChannel, generateRandomWord } from "./helpers/context.js";
import { openRoomFromNavigation } from "./helpers/room.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Changer le pseudonyme via la commande /NICK", async ({ page }) => {
	await page.goto("/");

	const channelToJoin = generateRandomChannel();

	const newNick = generateRandomWord();
	const currentNick = await connectChat({ page, channels: channelToJoin });

	await sendMessage(page, channelToJoin, `/nick ${newNick}`);

	await containsMessage(
		page,
		channelToJoin,
		`${currentNick} est désormais connu sous le nom de ${newNick}`,
	);
});

test("Changer le pseudonyme via la boite de dialogue", async ({ page }) => {
	await page.goto("/");

	const channelToJoin = generateRandomChannel();
	const layerName = "user-change-nickname-dialog";
	const currentNick = await connectChat({ page, channels: channelToJoin });

	const [_, $channelRoom] = await openRoomFromNavigation(page, channelToJoin);

	const $btnChangeNick = $channelRoom.locator(".btn-change-nick");
	await $btnChangeNick.click();

	await page.waitForTimeout(250);

	const $teleportChangeNickRequest = page.locator(`#${layerName}_teleport`);

	const newNick = generateRandomWord();
	const $inputNickname = $teleportChangeNickRequest.locator("#nickname");
	await $inputNickname.fill(newNick);

	const $btnSubmit = $teleportChangeNickRequest.getByText("Changer maintenant");
	await $btnSubmit.click();

	await page.waitForTimeout(250);

	await containsMessage(
		page,
		channelToJoin,
		`${currentNick} est désormais connu sous le nom de ${newNick}`,
	);
});
