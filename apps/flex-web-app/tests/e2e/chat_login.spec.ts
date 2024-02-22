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
import { generateRandomChannel, generateRandomWord } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Connexion au Chat", async ({ page }) => {
	const nickname = generateRandomWord();
	const channelToJoin = generateRandomChannel();

	await page.goto("/");

	await page.locator("#nickname").fill(nickname);
	await page.locator("#channels").fill(channelToJoin);

	const $btnLogin = page.locator('#chat-login-view button[type="submit"]');
	await $btnLogin.click();

	const $navChannelRoom = page
		.locator(".navigation-area .navigation-server ul li")
		.getByText(channelToJoin);

	await $navChannelRoom.click();

	const $mainRoom = page.locator(".room\\/main");
	await expect($mainRoom).toContainText(`Vous avez rejoint le salon ${channelToJoin}`);
});

test("Connexion au Chat sans aucun salon, RPL_WELCOME", async ({ page }) => {
	const nickname = generateRandomWord();

	await page.goto("/");
	await page.locator("#nickname").fill(nickname);
	await page.locator("#channels").fill("");

	const $btnLogin = page.locator('#chat-login-view button[type="submit"]');
	await $btnLogin.click();

	const $navServer = page.locator(".navigation-area .navigation-server");
	await expect($navServer).toHaveText("Flex");

	const $mainRoom = page.locator(".room\\/main");
	await expect($mainRoom).toContainText(`Bienvenue sur le réseau ${nickname}!${nickname}@adm.phisy.rc`);
});
