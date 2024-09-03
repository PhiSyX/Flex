// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Locator, Page, expect } from "@playwright/test";
import { ChatPageContext } from "./context.js";

export class ChatChannelContext
{
	static generate_name()
	{
		return `#test-x${(Math.random() + 1).toString(36).slice(2)}x`;
	}

	public channel_name!: string;
	private key?: string;

	constructor(private user: { page: Page; nick: string; })
	{
		this.channel_name = ChatChannelContext.generate_name();
	}

	with_channel(channel: string): this
	{
		this.channel_name = channel;
		return this;
	}

	with_key(key: string): this
	{
		this.key = key;
		return this;
	}

	async define_settings(settings_label: string, settings_value?: unknown, channel = this.channel_name)
	{
		let layer_name = "channel-settings-layer";

		let $room = this.user.page.locator(`[data-room="${channel}"] .room\\/main`);
		await $room.dblclick();

		let $teleport = this.user.page.locator(`#${layer_name}_teleport`);
		let $settings = $teleport
			.locator("ul li label")
			.getByText(settings_label);
		if (settings_label.indexOf("(+l)") >= 0) {
			await Promise.all(
				new Array(settings_value as number)
				.fill(0)
				.map(_ => $settings.click())
			);
		} else {
			await $settings.click();
		}

		let $submit_btn = $teleport.locator('button[type="submit"]');
		await $submit_btn.click();

		let mode = settings_label.slice(-3, -1);
		this.contains_message(`* ${this.user.nick} a défini les modes: ${mode}`, channel);
	}

	async undefine_settings(settings: string, channel = this.channel_name)
	{
		let layer_name = "channel-settings-layer";

		let $room = this.user.page.locator(`[data-room="${channel}"] .room\\/main`);
		await $room.dblclick();

		let $teleport = this.user.page.locator(`#${layer_name}_teleport`);
		let $invite_only_settings = $teleport
			.locator("ul li label")
			.getByText(settings);
		await $invite_only_settings.click();

		let $submit_btn = $teleport.locator('button[type="submit"]');
		await $submit_btn.click();

		let mode = settings.slice(-3, -1).replace('+', '-');
		this.contains_message(`* ${this.user.nick} a défini les modes: ${mode}`, channel);
	}

	async banall()
	{
		await this.send_message(`/BAN ${this.channel_name} *!*@*`);
		await this.contains_message(`* ${this.user.nick} a défini les modes: +b *!*@*`);
	}

	async banexcept(pattern: string)
	{
		await this.send_message(`/BANEX ${this.channel_name} ${pattern}`);
		await this.contains_message(`* ${this.user.nick} a défini les modes: +e ${pattern}`);
	}
	async unbanexcept(pattern: string)
	{
		await this.send_message(`/UNBANEX ${this.channel_name} ${pattern}`);
		await this.contains_message(`* ${this.user.nick} a défini les modes: -e ${pattern}`);
	}

	async bannick(
		user: ChatPageContext,
		opt: {
			channel?: string;
			with_permission?: boolean;
		} = {
			channel: this.channel_name,
			with_permission: true,
		}
	)
	{
		opt.channel ||= this.channel_name;

		await this.send_message(`/BAN ${this.channel_name} ${user.nick}!*@*`, {
			from: opt.channel,
		});

		if (opt.with_permission) {
			await this.contains_message(
				`* ${this.user.nick} a défini les modes: +b ${user.nick}!*@*`,
				opt.channel,
			);
		}
	}

	async unbannick(
		user: ChatPageContext,
		opt: {
			channel?: string;
			with_permission?: boolean;
		} = {
			channel: this.channel_name,
			with_permission: true,
		}
	)
	{
		opt.channel ||= this.channel_name;

		await this.send_message(`/UNBAN ${opt.channel} ${user.nick}!*@*`, {
			from: opt.channel,
		});

		if (opt.with_permission) {
			await this.contains_message(
				`* ${this.user.nick} a défini les modes: -b ${user.nick}!*@*`,
				opt.channel,
			);
		}
	}

	async change_topic(
		topic: string,
		opt: {
			channel?: string;
			error?: (chan: string) => string,
		} = {
			channel: this.channel_name,
		}
	)
	{
		opt.channel ||= this.channel_name;

		await this.send_message(`/topic ${opt.channel} ${topic}`, {
			from: opt.channel,
			error: opt.error,
		});

		if (opt.error) {
			return;
		}

		await this.contains_message(
			(chan) => `Tu as mis à jour le sujet du salon ${chan}: Mon super topic`,
			opt.channel
		);
	}

	async change_topic_from_editbox(
		topic: string,
		opt: {
			channel?: string;
			error?: (chan: string) => string,
		} = {
			channel: this.channel_name,
		}
	)
	{
		let $channel = this.user.page.locator(`div[data-room="${opt.channel}"]`);
		await $channel.locator(".room\\/topic\\:text p").dblclick();
		await this.user.page.waitForTimeout(250);

		let $topic = $channel.locator(".room\\/topic\\:text input");
		await $topic.fill(topic);
		await $topic.blur();

		await this.user.page.waitForTimeout(250);

		await this.contains_message(
			(chan) => `Tu as mis à jour le sujet du salon ${chan}: Mon super topic`,
			opt.channel
		);
	}

	async close_from_nav(channel = this.channel_name)
	{
		let $rooms = this.user.page.locator(".navigation-area .navigation-server ul");
		let $room = $rooms.locator(`li[data-room="${channel}"]`);
		await $room.click();
		await this.user.page.waitForTimeout(500);
		let $close_btn = $room.locator(".close");
		await $close_btn.click();
	}

	async close_from_room(channel = this.channel_name)
	{
		let $rooms = this.user.page.locator(".navigation-area .navigation-server ul");
		let $itemRoom = $rooms.locator(`li[data-room="${channel}"]`);
		await $itemRoom.click();
		await this.user.page.waitForTimeout(500);
		let $channel = this.user.page.locator(`div[data-room="${channel}"]`);
		let $actions = $channel.locator(".room\\/topic\\:action");
		let $close_btn = $actions.locator(".close");
		await $close_btn.click();
	}

	async invite(user: ChatPageContext, channel: string)
	{
		await this.send_message(`/invite ${user.nick} ${channel}`);
		await user.chan.contains_message(
			`${user.nick} a été invité à rejoindre le salon ${channel}`
		);
	}

	async join(
		channel = this.channel_name,
		opt: {
			key?: string,
			from?: string;
			from_dialog?: boolean;
			with_settings_label?: string;
			with_settings_value?: unknown;
			error?: (channel: string) => string;
		} = {
			key: this.key,
			from: this.channel_name,
			from_dialog: false,
		},
	)
	{
		if (opt.from_dialog) {
			await this.#join_from_dialog(channel, opt.key);
		} else if (opt.with_settings_label) {
			await this.#join_sending_command(channel, opt.key);
			await this.define_settings(
				opt.with_settings_label,
				opt.with_settings_value,
				channel
			);
		} else {
			await this.#join_sending_command(channel, opt.key);
		}

		if (opt.error) {
			if (opt.from) {
				await this.navigate_to(opt.from);
			}
			await this.contains_message(opt.error(channel), opt.from);
			return;
		}

		await this.contains_message(
			`Tu as rejoint le salon ${channel}`,
			channel,
		);
	}

	async join_using_dialog()
	{
		await this.join(this.channel_name, { key: this.key, from_dialog: true });
	}

	async #join_from_dialog(channel: string, key?: string)
	{
		let $nav = this.user.page.locator(".navigation-area #goto-channel-list");
		await $nav.click();

		let layer_name = "channel-join-layer";

		let $btn = this.user.page.locator(`#${layer_name}_btn`);
		await $btn.click();

		let $teleport = this.user.page.locator(`#${layer_name}_teleport`);

		let $input_channels = $teleport.locator("input#channels");
		await $input_channels.fill(channel);

		if (key) {
			let $input_keys = $teleport.locator("input#keys");
			await $input_keys.fill(key || "");
		}

		let $submit_btn = $teleport.getByText("Rejoindre maintenant");
		await $submit_btn.click();
	}

	async #join_sending_command(channel: string, key?: string)
	{
		let $form = this.user.page.locator("form[action^='/msg/']");
		let $input = $form.locator("input[type='text']");
		let _key = key != null ? ` ${key}` : "";
		await $input.fill(`/join ${channel}${_key}`);
		let $submit_btn = $form.locator("button[type='submit']");
		await $submit_btn.click();
	}

	async kick(
		user: ChatPageContext,
		reason: string,
		opt: {
			channel?: string;
			from_menu?: boolean;
			error?: (channel: string) => string;
		} = {
			channel: this.channel_name,
			from_menu: false,
		}
	)
	{
		opt.channel ||= this.channel_name;

		// Owner View
		if (opt.from_menu) {
			await this.#kick_from_menu(opt.channel, user, reason);
		} else {
			await this.send_message(`/kick ${opt.channel} ${user.nick} ${reason}`, {
				from: opt.channel,
				error: opt.error,
			});
		}

		if (opt.error) {
			await this.contains_message(
				opt.error(opt.channel),
				opt.channel,
			);
			return;
		}

		let oreason_re = new RegExp(
			`\\* Kicks: ${user.nick} a été sanctionné par [a-zA-Z0-9_]+ \\(Raison: ${reason}\\)`
		);
		await this.contains_message(oreason_re, opt.channel);

		// User View
		let ureason_re = new RegExp(
			`Tu as été sanctionné par [a-zA-Z0-9_]+ du salon ${opt.channel} pour la raison suivante « ${reason} » !`
		);

		console.error({ureason_re});
		await user.chan.contains_message(ureason_re, opt.channel);
	}

	async #kick_from_menu(channel: string, user: ChatPageContext, _reason: string)
	{
		let $menu = await this.select_member(user, channel);
		let $kick = $menu.locator("li").getByText("Expulser");
		await $kick.click();
	}

	async kick_using_menu(
		user: ChatPageContext,
		reason: string,
		opt: {
			channel?: string;
			error?: (channel: string) => string;
		} = {
			channel: this.channel_name
		}
	)
	{
		await this.kick(user, reason, { ...opt, from_menu: true });
	}

	async notice(message: string, opt: {
		target?: ChatPageContext | string;
		access_level_min?: string;
	} = {
		target: this.channel_name,
	})
	{
		opt.target ||= this.channel_name;
		if (typeof opt?.target === "string"){
			await this.send_message(`/notice ${opt.target} ${message}`, {
				from: opt.target
			});
		} else if (opt?.target) {
			await this.send_message(
				`/notice ${opt.access_level_min || ""}${opt.target.nick} ${message}`,
				{
					from: opt.target.nick,
				}
			);
		}
	}

	async part(reason?: string, channel = this.channel_name)
	{
		await this.send_message(`/part ${channel} ${reason || ""}`);
	}

	async sajoin(
		channel: string,
		user: { page: Page; nick: string; },
		opt: { with_permission: boolean } = { with_permission: true }
	)
	{
		await this.send_message(`/sajoin ${user.nick} ${channel}`);

		if (!opt.with_permission) {
			await this.contains_message(
				"* Permission refusée. Tu n'as pas les privilèges d'opérateur corrects."
			);
		}
	}

	async sapart(
		channel: string,
		user: { page: Page; nick: string; },
		opt: { with_permission: boolean } = { with_permission: true }
	)
	{
		await this.send_message(`/sapart ${user.nick} ${channel}`);

		if (!opt.with_permission) {
			await this.contains_message(
				"* Permission refusée. Tu n'as pas les privilèges d'opérateur corrects.",
				channel,
			);
		}
	}

	async send_message(
		message: ((channel: string, real_channel: string) => string) | string,
		opt: {
			from?: string;
			error?: (channel: string, real_channel: string) => string;
		} = {
			from: this.channel_name,
		},
	)
	{
		opt.from ||= this.channel_name;

		// NOTE: pour être sûr que nous sommes bien dans le bon salon.
		await this.navigate_to(opt.from);
		let $channel = this.user.page.locator(`div[data-room="${opt.from}"]`);
		let name = opt.from.startsWith("#") ? opt.from : opt.from.toLowerCase();
		let $form = $channel.locator(`form[action='/msg/${encodeURIComponent(name)}']`);
		let $input = $form.locator("input[type='text']");

		let msg: string;
		if (typeof message === "string") {
			msg = message;
		} else {
			msg = message(opt.from, this.channel_name);
		}

		await $input.fill(msg);
		let $submit_btn = $form.locator("button[type='submit']");
		await $submit_btn.click();

		if (opt.error) {
			await this.contains_message(
				opt.error(opt.from, this.channel_name),
				opt.from,
			);
			return;
		}

		if (!msg.startsWith("/")) {
			await this.contains_message(msg, opt.from);
		}
	}

	async navigate_to(channel: string)
	{
		let $nav = this.user.page.locator(".navigation-area .navigation-server ul li")
			.getByText(channel)
			.or(
				this.user.page.locator(".navigation-area .navigation-server summary")
					.getByText(channel)
			);
		await $nav.click();
	}

	async contains_message(
		message: ((channel: string) => string | RegExp) | string | RegExp,
		channel = this.channel_name,
	)
	{
		let $channel = this.user.page.locator(`div[data-room="${channel}"]`);
		let $main = $channel.locator(".room\\/main");
		if (typeof message === "string" || message instanceof RegExp) {
			await expect($main).toContainText(message);
		} else {
			await expect($main).toContainText(message(channel));
		}
	}

	async not_contains_message(
		message: ((channel: string) => string | RegExp) | string | RegExp,
		channel = this.channel_name,
	)
	{
		let $channel = this.user.page.locator(`div[data-room="${channel}"]`);
		let $main = $channel.locator(".room\\/main");
		if (typeof message === "string" || message instanceof RegExp) {
			await expect($main).not.toContainText(message);
		} else {
			await expect($main).not.toContainText(message(channel));
		}
	}

	async select_member(
		user: { nick: string },
		channel: string = this.channel_name,
	): Promise<Locator>
	{
		let $channel = this.user.page.locator(`div[data-room="${channel}"]`);
		let $userlist = $channel.locator(".room\\/userlist");
		let $nick = $userlist.locator("li").getByText(user.nick);
		await $nick.click();
		return $channel.locator(".room\\/userlist\\:menu");
	}
}
