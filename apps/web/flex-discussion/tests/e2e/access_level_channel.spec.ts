// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { test } from "@playwright/test";

import { ChatBrowserContext } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Change les niveaux d'accès d'un membre via les /<commande>'s", async ({
	browser,
}) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();

	// NOTE: Owner

	let SET = [
		["QOP", "+q"],
		["AOP", "+a"],
		["OP", "+o"],
		["HOP", "+h"],
		["VIP", "+v"],
	];
	for (let [cmd, mode] of SET) {
		await owner.chan.send_message(`/${cmd} ${user.nick}`);
		let mode_set = `* ${owner.nick} a défini les modes: ${mode} ${user.nick}`;
		await owner.chan.contains_message(mode_set);
		await user.chan.contains_message(mode_set);
	}

	let UNSET = [
		["DEQOP", "-q"],
		["DEAOP", "-a"],
		["DEOP", "-o"],
		["DEHOP", "-h"],
		["DEVIP", "-v"],
	];
	for (let [cmd, mode] of UNSET) {
		await owner.chan.send_message(
			`/${cmd} ${user.nick}`,
		);
		let mode_set = `* ${owner.nick} a défini les modes: ${mode} ${user.nick}`;
		await owner.chan.contains_message(mode_set);
		await user.chan.contains_message(mode_set);
	}

	// NOTE: User
	await user.chan.send_message(`/op ${owner.nick}`, {
		error(channel) {
			return `* ${channel} :Tu n'es pas opérateur sur ce salon`;
		},
	});
	await user.chan.send_message(`/deop ${owner.nick}`, {
		error(channel) {
			return `* ${channel} :Tu n'es pas opérateur sur ce salon`;
		},
	});
});

test("Change les niveaux d'accès d'un membre via le menu de la liste des utilisateurs du salon", async ({
	browser,
}) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();

	// NOTE: Owner
	let $menu = await owner.chan.select_member(user);

	let SET = ["+q", "+a", "+o", "+h", "+v"];
	for (let mode of SET) {
		let $mode_item = $menu.locator("li").getByText(mode);
		await $mode_item.click();

		let mode_set = `* ${owner.nick} a défini les modes: ${mode} ${user.nick}`;
		await owner.chan.contains_message(mode_set);
		await user.chan.contains_message(mode_set);
	}

	let UNSET = ["-q", "-a", "-o", "-h", "-v"];
	for (let mode of UNSET) {
		let $mode_item = $menu.locator("li").getByText(mode);
		await $mode_item.click();

		let mode_set = `* ${owner.nick} a défini les modes: ${mode} ${user.nick}`;
		await owner.chan.contains_message(mode_set);
		await user.chan.contains_message(mode_set);
	}
});
