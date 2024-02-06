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
import { createNBrowserPages, generateRandomWord } from "./context.js";

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
	const [user1, user2] = await Promise.all(
		(await createNBrowserPages(2)(browser)).map(async (futPage) => {
			const page = await futPage;
			const nick = await connectChat({ page, channels: opts?.channels });
			return { page, nick };
		}),
	);
	return { user1, user2 };
}

export function connectNUsersToChat(n: number) {
	let pagesFn = createNBrowserPages(n);
	return async ({ browser }: { browser: Browser }, opts?: { channels?: string }) => {
		return Promise.all(
			(await pagesFn(browser)).map(async (futPage) => {
				const page = await futPage;
				const nick = await connectChat({ page, channels: opts?.channels });
				return { page, nick };
			}),
		);
	};
}
