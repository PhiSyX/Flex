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

import { ChatChannelContext } from "./helpers/channel.js";
import { ChatBrowserContext } from "./helpers/context.js";

// See here how to get started:
// https://playwright.dev/docs/intro

test("Invite un utilisateur dans un salon via la commande /INVITE", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();
	let channel_name_to_invite = ChatChannelContext.generate_name();
	await owner.chan.join(channel_name_to_invite);
	await owner.chan.invite(user, channel_name_to_invite);
	await user.chan.join(channel_name_to_invite);
});

test("Paramètre de salon +i", async ({ browser }) => {
	let chat_ctx = await ChatBrowserContext.connect(browser);
	let { owner, user } = await chat_ctx.users_with_permissions();
	let channel_name_to_invite = ChatChannelContext.generate_name();
	await owner.chan.join(channel_name_to_invite, {
		with_settings: "Salon accessible sur invitation uniquement (+i)",
	});
	// NOTE: Utilisateur tente de joindre le salon, alors qu'il n'est pas invité.
	await user.chan.join(channel_name_to_invite, {
		error(channel) {
			return `* ${channel} :Tu ne peux pas rejoindre le salon (+i)`
		},
	});

	// NOTE: le propriétaire invite l'utilisateur
	await owner.chan.invite(user, channel_name_to_invite);
	await user.chan.join(channel_name_to_invite);
});
