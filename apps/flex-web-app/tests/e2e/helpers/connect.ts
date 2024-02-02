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
import { createTwoUsers } from "./context.js";

export async function connectChat({
	page,
	channels = "",
}: { page: Page; channels: string }): Promise<string> {
	// biome-ignore lint/style/useTemplate: Pas envie.
	const nickname = "x" + (Math.random() + 1).toString(36).slice(2) + "x";

	await page.goto("/");
	await page.locator("#nickname").fill(nickname);
	await page.locator("#channels").fill(channels);

	const $btnLogin = page.locator('#chat-login-view button[type="submit"]');
	await $btnLogin.click();

	return nickname;
}

export async function connectUsersToChat(
	{ browser }: { browser: Browser },
	{ channels }: { channels: string },
) {
	const { user1, user2 } = await createTwoUsers(browser);
	const nick1 = await connectChat({ page: user1, channels });
	const nick2 = await connectChat({ page: user2, channels });
	return {
		user1: {
			page: user1,
			nick: nick1,
		},
		user2: {
			page: user2,
			nick: nick2,
		},
	};
}
