// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Browser, Page, expect } from "@playwright/test";
import { env } from "process";
import { ChatChannelContext } from "./channel.js";
import { ChatPrivateContext } from "./private.js";

export class ChatBrowserContext
{
	static async connect(
		browser: Browser,
		channels: string = ChatChannelContext.generate_name(),
	)
	{
		let page1: Page;
		let page2: Page;
		let page3: Page;

		if (env.CI) {
			let browser_ctx1 = await browser.newContext();
			let browser_ctx2 = await browser.newContext();
			page1 = await browser_ctx1.newPage();
			page2 = await browser_ctx2.newPage();
			page3 = await browser_ctx2.newPage();
		} else {
			let browser_ctx1 = await browser.newContext();
			page1 = await browser_ctx1.newPage();
			page2 = await browser_ctx1.newPage();
			page3 = await browser_ctx1.newPage();
		}

		let nick = ChatPageContext.generate_nick() + "_globop";
		let chat_ctx1 = await ChatPageContext.connect(page1, channels, nick);
		page2.waitForTimeout(300);
		let chat_ctx2 = await ChatPageContext.connect(page2, channels);
		page2.waitForTimeout(300);
		let chat_ctx3 = await ChatPageContext.connect(page3, channels);
		return new ChatBrowserContext(chat_ctx1, chat_ctx2, chat_ctx3);
	}

	static async connect_many(
		total: number,
		browser: Browser,
		channels: string = ChatChannelContext.generate_name(),
	) {
		let browser_ctx = browser.newContext();
		let pages_future: Array<Promise<Page>> = Array.from({ length: total }, async () => {
			return (env.CI ? browser.newContext() : browser_ctx).then((ctx) => ctx.newPage());
		});

		let pages = await Promise.all(pages_future.map(
			async (future_page) => ChatPageContext.connect(await future_page, channels)
		));

		return new ChatBrowserContext(...pages);
	}

	// -------- //
	// Property //
	// -------- //

	#contexts: Array<ChatPageContext> = [];

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(...contexts: Array<ChatPageContext>)
	{
		this.#contexts = contexts;
	}

	/**
	 * Premier utilisateur.
	 */
	first()
	{
		return this.#contexts[0];
	}

	/**
	 * Second utilisateur.
	 */
	second()
	{
		return this.#contexts[1];
	}

	get_user(idx: number) {
		return this.#contexts[idx];
	}

	last()
	{
		return this.#contexts.at(-1) as ChatPageContext;
	}

	/**
	 * Tous les utilisateurs en ne comptant pas les 2 premiers.
	 */
	users()
	{
		return this.#contexts.slice(2);
	}

	/**
	 * Tous les utilisateurs.
	 */
	all_users()
	{
		return this.#contexts;
	}

	async users_with_permissions()
	{
		await this.get_user(0).chan.send_message("/oper test-globop test");

		await this.get_user(0).chan.send_message(`/qop ${this.get_user(1).nick}`);
		await this.get_user(0).chan.send_message(`/deqop ${this.get_user(2).nick}`);

		await this.timeout(1000);

		return {
			globop: this.get_user(0),
			owner: this.get_user(1),
			user: this.get_user(2),
		};
	}

	async all_users_with_access_level()
	{
		expect(this.#contexts.length).toBeGreaterThanOrEqual(7);
		
		await this.get_user(0).chan.send_message("/oper test-globop test");
		
		for (let user of this.all_users()) {
			await this.get_user(0).chan.send_message(`/deqop ${user.nick}`);
			await this.get_user(0).chan.send_message(`/deaop ${user.nick}`);
			await this.get_user(0).chan.send_message(`/deop ${user.nick}`);
			await this.get_user(0).chan.send_message(`/dehop ${user.nick}`);
			await this.get_user(0).chan.send_message(`/devip ${user.nick}`);
		}

		await this.get_user(0).chan.send_message(`/qop ${this.get_user(1).nick}`);
		await this.get_user(0).chan.send_message(`/aop ${this.get_user(2).nick}`);
		await this.get_user(0).chan.send_message( `/op ${this.get_user(3).nick}`);
		await this.get_user(0).chan.send_message(`/hop ${this.get_user(4).nick}`);
		await this.get_user(0).chan.send_message(`/vip ${this.get_user(5).nick}`);

		return {
			globop: this.get_user(0),
			qop: this.get_user(1),
			aop: this.get_user(2),
			op: this.get_user(3),
			hop: this.get_user(4),
			vip: this.get_user(5),
			user: this.get_user(6),
		};
	}
	
	async timeout(timeout: number)
	{
		await Promise.all(
			this.all_users()
				.map((user) => user.page.waitForTimeout(timeout))
		);
	}
}

export class ChatPageContext
{
	static generate_nick(): string
	{
		return `x${(Math.random() + 1).toString(36).slice(2)}x`;
	}

	static async connect(page: Page, channels = "", nick = ChatPageContext.generate_nick())
	{
		await page.goto("/chat");
		await page.locator("#nickname").fill(nick);
		await page.locator("#channels").fill(channels);
		let $btn = page.locator('#chat-login-view button[type="submit"]');
		await $btn.click();
		await page.waitForTimeout(250);
		return new ChatPageContext(page, nick, channels);
	}

	page: Page;
	nick: string;
	priv: ChatPrivateContext;
	chan: ChatChannelContext;

	constructor(
		page: ChatPageContext["page"], 
		nick: ChatPageContext["nick"], 
		channels?: string
	)
	{
		this.page = page;
		this.nick = nick;
		this.chan = new ChatChannelContext({ page, nick });
		if (channels) {
			this.chan.with_channel(channels);
		}
		this.priv = new ChatPrivateContext({ page, nick });
	}

	async change_nick(new_nick = ChatPageContext.generate_nick())
	{
		await this.chan.send_message(`/nick ${new_nick}`);
		await this.chan.contains_message(
			`${this.nick} est désormais connu sous le nom de ${new_nick}`,
		);
	}

	async change_nick_from_dialog(new_nick = ChatPageContext.generate_nick())
	{
		let $btn = this.page.locator(".btn-change-nick");
		await $btn.click();
		
		let layer_name = "user-change-nickname-dialog";
		let $teleport = this.page.locator(`#${layer_name}_teleport`);

		let $input = $teleport.locator("#nickname");
		await $input.fill(new_nick);
	
		let $submit_btn = $teleport.getByText("Changer maintenant");
		await $submit_btn.click();
	
		await this.chan.contains_message(
			`${this.nick} est désormais connu sous le nom de ${new_nick}`,
		);
	}

	/**
	 * Kill 
	 */
	async kill(
		user: ChatPageContext,
		reason: string,
		opt: {
			error?: () => string;
		} = {}
	)
	{
		// FIXME: améliorer le message du quit.
		// Normalement, cela devrait être la raison du KILL + autre info.
		let quit_reason_message = "socket was forcefully disconnected from the namespace";

		await this.chan.send_message(`/kill ${user.nick} ${reason}`);

		if (opt.error) {
			await this.chan.contains_message(opt.error());
			return;
		}

		await this.chan.contains_message(
			`* Quits: ${user.nick} (${user.nick}@flex.chat) (${quit_reason_message})`,
		);

		let $teleport = user.page.locator("#error-layer_teleport");
		await expect($teleport).toContainText(
			`Déconnexion: tu as été sanctionné d'un KILL par ${this.nick} (${reason})`,
		);
	}
}

export function generate_random_channel() {
	return `#test-x${(Math.random() + 1).toString(36).slice(2)}x`;
}
