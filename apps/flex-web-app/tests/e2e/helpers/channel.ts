// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Locator, Page, expect } from "@playwright/test";

export async function sendMessage(
	page: Page,
	channel: string,
	message: string,
) {
	const $channelRoom = page.locator(`.room\\/channel[data-room="${channel}"]`);
	const $formRoom = $channelRoom.locator(
		`form[action='/privmsg/${encodeURIComponent(channel)}']`,
	);
	const $inputRoom = $formRoom.locator("input[type='text']");
	await $inputRoom.fill(message);
	const $btnSubmit = $formRoom.locator("button[type='submit']");
	await $btnSubmit.click();
	await page.waitForTimeout(250);
}

export async function containsMessage(
	page: Page,
	channel: string,
	message: string,
) {
	const $channelRoom = page.locator(`.room\\/channel[data-room="${channel}"]`);
	const $channelMain = $channelRoom.locator(".room\\/main");
	await expect($channelMain).toContainText(message);
}

export async function selectNickFromUserlist(
	page: Page,
	channel: string,
	nick: string,
): Promise<Locator> {
	const $channelRoom = page.locator(`.room\\/channel[data-room="${channel}"]`);
	const $userlist = $channelRoom.locator(".room\\/userlist");
	const $nick = $userlist.locator("li").getByText(nick);
	await $nick.click();
	const $userlistMenu = $channelRoom.locator(".room\\/userlist\\:menu");
	return $userlistMenu;
}

export async function kickNickFromUserlistMenu(
	page: Page,
	channel: string,
	knick: string,
) {
	const $userlistMenu = await selectNickFromUserlist(page, channel, knick);
	const $kickItem = $userlistMenu.locator("li").getByText("Kick");
	await $kickItem.click();
	await page.waitForTimeout(250);
}
