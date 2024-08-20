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

	async send(to: ChatPageContext, message: string, opt?: {
		waiting_list: boolean;
	})
	{
		let msg = `/privmsg ${to.nick} ${message}`;
		await this.send_message(to, msg);
		
		if (opt?.waiting_list) {
			await to.page.locator("#goto-private-list").click();
			await to.page.waitForTimeout(500);
			let $priv = to.page.locator(".private\\/list ul li")
				.getByTitle(`Ouvrir le privé de ${this.user.nick}.`);
			await $priv.click();
			await to.page.waitForTimeout(500);
			let $btn_accept = to.page
				.locator("#private-pending-request-layer_teleport footer button")
				.getByText("Accepter");
			await $btn_accept.click();
		}

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
