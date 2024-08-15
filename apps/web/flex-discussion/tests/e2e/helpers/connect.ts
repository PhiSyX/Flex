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
import { env } from "process";
import { createNBrowserPages, generateRandomWord } from "./context.js";

export async function connectChat({
	page,
	channels = "",
}: { page: Page; channels?: string }): Promise<string> {
	const nickname = generateRandomWord();

	await page.goto("/chat");
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
	let page1: Page;
	let page2: Page;

	if (env.CI) {
		const bCtx1 = await browser.newContext();
		const bCtx2 = await browser.newContext();
		page1 = await bCtx1.newPage();
		page2 = await bCtx2.newPage();
	} else {
		const bCtx1 = await browser.newContext();
		page1 = await bCtx1.newPage();
		page2 = await bCtx1.newPage();
	}

	const nick1 = await connectChat({ page: page1, channels: opts?.channels });
	page2.waitForTimeout(250);
	const nick2 = await connectChat({ page: page2, channels: opts?.channels });
	const user1 = { page: page1, nick: nick1 };
	const user2 = { page: page2, nick: nick2 };
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
