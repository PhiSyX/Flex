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
import { ChatPageContext } from "./context.js";

export class ChatPrivateContext
{
	constructor(private user: { page: Page; nick: string; })
	{
	}

	async ignore(user: ChatPageContext)
	{
		const $room = this.user.page.locator(`div[data-room="${user.nick}"]`);
		const $ignore_btn = $room.getByTitle(`Ignorer ${user.nick}`);
		await $ignore_btn.click();
		await this.contains_message(user, `${user.nick} est désormais ignoré.`);
	}

	async unignore(user: ChatPageContext)
	{
		const $room = this.user.page.locator(`div[data-room="${user.nick}"]`);
		const $ignore_btn = $room.getByTitle(`Ne plus ignorer ${user.nick}`);
		await $ignore_btn.click();
		await this.contains_message(user, `${user.nick} n'est désormais plus ignoré.`);
	}

	async send(to: ChatPageContext, message: string)
	{
		let msg = `/privmsg ${to.nick} ${message}`;
		await this.send_message(to, msg);
		msg = this.user.nick + " :" + msg.slice(`/privmsg ${to.nick} `.length);
		await this.contains_message(to, msg);
	}

	async send_message(
		to: ChatPageContext,
		message: string,
	) 
	{
		await this.navigate_to("Flex");

		let $priv = this.user.page.locator("div[data-room='Flex']");
		let $form = $priv.locator(`form[action='/msg/flex']`);
		let $input = $form.locator("input[type='text']");

		await $input.fill(message);
		let $submit_btn = $form.locator("button[type='submit']");
		await $submit_btn.click();

		if (!message.startsWith("/")) {
			await this.contains_message(to, message);
		}
	}

	async navigate_to(nick: string)
	{
		let $nav = this.user.page.locator(".navigation-area .navigation-server ul li")
			.getByText(nick)
			.or(
				this.user.page.locator(".navigation-area .navigation-server summary")
					.getByText(nick)
			);
		await $nav.click();
	}

	async contains_message(
		user: ChatPageContext,
		message: string | RegExp, 
	)
	{
		await this.navigate_to(user.nick);
		let $priv = this.user.page.locator(`div[data-room="${user.nick}"]`);
		let $main = $priv.locator(".room\\/main");
		await expect($main).toContainText(message);
	}

	async not_contains_message(
		priv: ChatPageContext,
		message: string | RegExp, 
	) 
	{
		let $priv = this.user.page.locator(`div[data-room="${priv.nick}"]`);
		let $main = $priv.locator(".room\\/main");
		await expect($main).not.toContainText(message);
	}
}

export async function sendMessage(page: Page, priv: string, message: string) {
	const $privateRoom = page.locator(`div[data-room="${priv}"]`);
	const $formRoom = $privateRoom.locator(`form[action='/msg/${encodeURIComponent(priv)}']`);
	const $inputRoom = $formRoom.locator("input[type='text']");
	await $inputRoom.fill(message);
	const $btnSubmit = $formRoom.locator("button[type='submit']");
	await $btnSubmit.click();
	await page.waitForTimeout(250);
}

export async function containsMessage(page: Page, priv: string, message: string) {
	const $privateRoom = page.locator(`div[data-room="${priv}"]`);
	const $privateMain = $privateRoom.locator(".room\\/main");
	await expect($privateMain).toContainText(message);
}

export async function notContainsMessage(page: Page, priv: string, message: string) {
	const $privateRoom = page.locator(`div[data-room="${priv}"]`);
	const $privateMain = $privateRoom.locator(".room\\/main");
	await expect($privateMain).not.toContainText(message);
}
