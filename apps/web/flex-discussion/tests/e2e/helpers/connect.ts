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
import { create_n_browser_pages, generate_random_word } from "./context.js";

export async function connect_chat({
	page,
	channels = "",
}: { page: Page; channels?: string }): Promise<string> {
	let nickname = generate_random_word();

	await page.goto("/chat");
	await page.locator("#nickname").fill(nickname);
	await page.locator("#channels").fill(channels);

	let $btn = page.locator('#chat-login-view button[type="submit"]');
	await $btn.click();

	return nickname;
}

export async function connect_users_to_chat(
	{ browser }: { browser: Browser },
	opts?: { channels?: string },
) {
	let page1: Page;
	let page2: Page;

	if (env.CI) {
		let browser_ctx1 = await browser.newContext();
		let browser_ctx2 = await browser.newContext();
		page1 = await browser_ctx1.newPage();
		page2 = await browser_ctx2.newPage();
	} else {
		let browser_ctx1 = await browser.newContext();
		page1 = await browser_ctx1.newPage();
		page2 = await browser_ctx1.newPage();
	}

	let nick1 = await connect_chat({ page: page1, channels: opts?.channels });
	page2.waitForTimeout(250);
	let nick2 = await connect_chat({ page: page2, channels: opts?.channels });
	let user1 = { page: page1, nick: nick1 };
	let user2 = { page: page2, nick: nick2 };
	return { user1, user2 };
}

export function connect_n_users_to_chat(n: number) {
	let pages_fn = create_n_browser_pages(n);
	return async ({ browser }: { browser: Browser }, opts?: { channels?: string }) => {
		return Promise.all(
			(await pages_fn(browser)).map(async (future_page) => {
				let page = await future_page;
				let nick = await connect_chat({ page, channels: opts?.channels });
				return { page, nick };
			}),
		);
	};
}
