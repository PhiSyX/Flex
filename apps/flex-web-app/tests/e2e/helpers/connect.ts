// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Browser, Page } from "@playwright/test";
import { createTwoUsers, generateRandomWord } from "./context.js";

export async function connectChat({
	page,
	channels = "",
}: { page: Page; channels?: string }): Promise<string> {
	const nickname = generateRandomWord();

	await page.goto("/");
	await page.locator("#nickname").fill(nickname);
	await page.locator("#channels").fill(channels);

	const $btnLogin = page.locator('#chat-login-view button[type="submit"]');
	await $btnLogin.click();

	return nickname;
}

export async function connectUsersToChat(
	{ browser }: { browser: Browser },
	opts?: { channels?: string },
) {
	const { user1, user2 } = await createTwoUsers(browser);
	const nick1 = await connectChat({ page: user1, channels: opts?.channels });
	const nick2 = await connectChat({ page: user2, channels: opts?.channels });
	return {
		user1: { page: user1, nick: nick1 },
		user2: { page: user2, nick: nick2 },
	};
}
