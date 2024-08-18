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
import { generate_random_channel, generate_random_word } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Connexion au Chat", async ({ page }) => {
	let nickname = generate_random_word();
	let channel_name = generate_random_channel();

	await page.goto("/chat");

	await page.locator("#nickname").fill(nickname);
	await page.locator("#channels").fill(channel_name);

	let $btn = page.locator('#chat-login-view button[type="submit"]');
	await $btn.click();

	let $nav = page
		.locator(".navigation-area .navigation-server ul li")
		.getByText(channel_name);

	await $nav.click();

	let $mainRoom = page.locator(".room\\/main");
	await expect($mainRoom).toContainText(`Tu as rejoint le salon ${channel_name}`);
});

test("Connexion au Chat sans aucun salon, RPL_WELCOME", async ({ page }) => {
	let nickname = generate_random_word();

	await page.goto("/chat");
	await page.locator("#nickname").fill(nickname);
	await page.locator("#channels").fill("");

	let $btn = page.locator('#chat-login-view button[type="submit"]');
	await $btn.click();

	let $nav = page.locator(".navigation-area .navigation-server");
	await expect($nav).toHaveText("Flex");

	let $main = page.locator(".room\\/main");
	await expect($main).toContainText(`Bienvenue sur le réseau ${nickname}!${nickname}@flex.chat`);
});
