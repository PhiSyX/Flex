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

export async function sendMessage(page: Page, priv: string, message: string) {
	const $privateRoom = page.locator(`.room\\/private[data-room="${priv}"]`);
	const $formRoom = $privateRoom.locator(
		`form[action='/msg/${encodeURIComponent(priv)}']`,
	);
	const $inputRoom = $formRoom.locator("input[type='text']");
	await $inputRoom.fill(message);
	const $btnSubmit = $formRoom.locator("button[type='submit']");
	await $btnSubmit.click();
	await page.waitForTimeout(250);
}

export async function containsMessage(
	page: Page,
	priv: string,
	message: string,
) {
	const $privateRoom = page.locator(`.room\\/private[data-room="${priv}"]`);
	const $privateMain = $privateRoom.locator(".room\\/main");
	await expect($privateMain).toContainText(message);
}

export async function notContainsMessage(
	page: Page,
	priv: string,
	message: string,
) {
	const $privateRoom = page.locator(`.room\\/private[data-room="${priv}"]`);
	const $privateMain = $privateRoom.locator(".room\\/main");
	await expect($privateMain).not.toContainText(message);
}
