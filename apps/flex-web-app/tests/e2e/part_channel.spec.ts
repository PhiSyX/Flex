// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { expect, test, type Page, Locator } from "@playwright/test";

// See here how to get started:
// https://playwright.dev/docs/intro

async function connectChat({
	page,
	channels = "",
}: { page: Page; channels?: string }): Promise<string> {
	// biome-ignore lint/style/useTemplate: Pas envie.
	const nickname = "x" + (Math.random() + 1).toString(36).slice(2) + "x";

	await page.goto("/");
	await page.locator("#nickname").fill(nickname);
	await page.locator("#channels").fill(channels);

	const $btnLogin = page.locator('#chat-login-view button[type="submit"]');
	await $btnLogin.click();

	return nickname;
}

async function partChannel(
	{ page, channel }: { page: Page; channel: string },
	testFn: (_: {
		$navRooms: Locator;
		$navRoomsItems: Locator;
		$channelRoom: Locator;
	}) => Promise<void>,
): Promise<string> {
	const nickname = await connectChat({ page, channels: channel });

	const $navRooms = page.locator(".navigation-area .navigation-server ul");
	const $navRoomsItems = $navRooms.locator(" li");
	await expect($navRoomsItems).toHaveCount(1);

	const $channelRoom = page.locator(`.room\\/channel[data-room="${channel}"]`);

	await testFn({
		$navRooms,
		$navRoomsItems,
		$channelRoom,
	});

	await expect($navRoomsItems).toHaveCount(0);
	await expect($navRoomsItems).not.toHaveCount(1);

	return nickname;
}

test("Partir d'un salon via la commande /PART", async ({ page }) => {
	const channelToPart = "#test-part-command";
	await partChannel(
		{ page, channel: channelToPart },
		async ({ $channelRoom }) => {
			const $form = $channelRoom.locator(
				`form[action='/privmsg/${encodeURIComponent(channelToPart)}']`,
			);

			const $input = $form.locator("input[type='text']");
			$input.fill(`/part ${channelToPart}`);

			const $btnSubmit = $form.locator("button[type='submit']");
			await $btnSubmit.click();
		},
	);
});

test("Partir d'un salon via la commande /PART avec un message", async ({
	browser,
}) => {
	const user1Context = await browser.newContext();
	const user2Context = await browser.newContext();

	const user1Page = await user1Context.newPage();
	const user2Page = await user2Context.newPage();

	const channelToPart = "#test-part2-command";

	await connectChat({ page: user2Page, channels: channelToPart });

	const pnick = await partChannel(
		{ page: user1Page, channel: channelToPart },
		async ({ $channelRoom }) => {
			const $form = $channelRoom.locator(
				`form[action='/privmsg/${encodeURIComponent(channelToPart)}']`,
			);

			const $input = $form.locator("input[type='text']");
			$input.fill(`/part ${channelToPart} Au revoir les amis.`);

			const $btnSubmit = $form.locator("button[type='submit']");
			await $btnSubmit.click();
		},
	);

	const $mainRoom = user2Page.locator(".room\\/main");
	await expect($mainRoom).toContainText(
		`* Parts: ${pnick} (${pnick}@F65E28A7.57B2.F6AB) (Au revoir les amis.) `,
	);
});

test("Partir d'un salon via le bouton de fermeture du la navigation", async ({
	page,
}) => {
	const channelToPart = "#test-part-channel";
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
	const channelToPart = "#test-part-channel";
	await partChannel(
		{ page, channel: channelToPart },
		async ({ $channelRoom }) => {
			const $topicActions = $channelRoom.locator(".room\\/topic\\:action");

			const $btnCloseChannelRoom = $topicActions.locator(".close");
			await $btnCloseChannelRoom.click();
		},
	);
});
