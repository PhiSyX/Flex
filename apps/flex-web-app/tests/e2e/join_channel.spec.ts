// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { expect, test, type Page } from "@playwright/test";

// See here how to get started:
// https://playwright.dev/docs/intro

async function connectChat({ page }: { page: Page }) {
	// biome-ignore lint/style/useTemplate: Pas envie.
	const nickname = "x" + (Math.random() + 1).toString(36).slice(2) + "x";

	await page.goto("/");
	await page.locator("#nickname").fill(nickname);
	await page.locator("#channels").fill("");

	const $btnLogin = page.locator('#chat-login-view button[type="submit"]');
	await $btnLogin.click();
}

async function joinChannel({
	page,
	channel,
	key = "",
}: {
	page: Page;
	channel: string;
	key?: string;
}) {
	await connectChat({ page });

	const $navServer = page.locator(".navigation-area .navigation-server");
	await expect($navServer).toHaveText("Flex");
	const $formRoom = page.locator("form[action='/privmsg/flex']");
	const $inputRoom = $formRoom.locator("input[type='text']");
	await $inputRoom.fill(`/join ${channel} ${key}`);
	const $btnSubmit = $formRoom.locator("button[type='submit']");
	await $btnSubmit.click();
}

test("Rejoindre un salon via la commande /JOIN", async ({ page }) => {
	const channelToJoin = "#test-join-command";
	await joinChannel({ page, channel: channelToJoin });
	const $mainRoom = page.locator(".room\\/main");
	await expect($mainRoom).toContainText(
		`Vous avez rejoint le salon ${channelToJoin}`,
	);
});

test("Rejoindre un salon avec une clé via la commande /JOIN", async ({
	browser,
}) => {
	const user1Context = await browser.newContext();
	const user2Context = await browser.newContext();
	const user1Page = await user1Context.newPage();
	const user2Page = await user2Context.newPage();

	const channelToJoin = "#test-join-with-key";

	await joinChannel({
		page: user1Page,
		channel: channelToJoin,
		key: "my-best-key",
	});

	const $mainRoom1 = user1Page.locator(".room\\/main");
	await expect($mainRoom1).toContainText(
		`Vous avez rejoint le salon ${channelToJoin}`,
	);

	await joinChannel({ page: user2Page, channel: channelToJoin });

	const $mainRoom2 = user2Page.locator(".room\\/main");
	await expect($mainRoom2).toContainText(
		`* ${channelToJoin} :Vous ne pouvez pas rejoindre le salon (+k)`,
	);
});

test("Rejoindre un salon via la boite de dialogue (de la vue ChannelList)", async ({
	page,
}) => {
	await connectChat({ page });

	const $channelListView = page.locator(".navigation-area #goto-channel-list");
	await $channelListView.click();

	const $btnChannelCreateRequest = page.locator("#channel-create-request_btn");
	await $btnChannelCreateRequest.click();

	await page.waitForTimeout(250);

	const $teleportChannelCreateRequest = page.locator(
		"#channel-create-request_teleport",
	);
	const $inputChannels =
		$teleportChannelCreateRequest.locator("input#channels");

	const channelToJoin = "#test-join-from-dialog";
	await $inputChannels.fill(channelToJoin);

	const $btnSubmit = $teleportChannelCreateRequest.getByText(
		"Rejoindre maintenant",
	);
	await $btnSubmit.click();

	await page.waitForTimeout(250);

	const $mainRoom = page.locator(".room\\/main");
	await expect($mainRoom).toContainText(
		`Vous avez rejoint le salon ${channelToJoin}`,
	);
});
