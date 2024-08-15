// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Page, expect } from "@playwright/test";

export async function sendMessageInActiveRoom(page: Page, message: string) {
	const $room = page.locator("div[data-room]");
	const $formRoom = $room.locator("form[action^='/msg/']");
	const $inputRoom = $formRoom.locator("input[type='text']");
	await $inputRoom.fill(message);
	const $btnSubmit = $formRoom.locator("button[type='submit']");
	await $btnSubmit.click();
	await page.waitForTimeout(250);
}

export async function containsMessageInActiveRoom(page: Page, message: string) {
	const $main = page.locator(".room\\/main");
	await expect($main).toContainText(message);
}

export async function openRoomFromNavigation(page: Page, room: string) {
	const $navRoom = page.locator(".navigation-area .navigation-server ul li").getByText(room);
	await $navRoom.click();
	await page.waitForTimeout(250);
	const $room = page.locator(`div[data-room="${room}"]`);
	return [$navRoom, $room];
}
