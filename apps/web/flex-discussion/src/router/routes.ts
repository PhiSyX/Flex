// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { RouteRecordRaw } from "vue-router";

import { View } from "@phisyx/flex-chat";

// -------- //
// Constant //
// -------- //

export const ROUTES: Array<RouteRecordRaw> = [
	{
		path: "/",
		strict: true,
		component: () => import("~/views/direct-access/DirectAccessView.vue"),
		name: View.DirectAccess,
	},

	{
		path: "/chat",
		component: () => import("~/views/chat/ChatLayout.vue"),
		children: [
			{
				path: "/server/:servername/channels",
				component: () =>
					import("~/views/chat/channel/ChannelListView.vue"),
				name: View.ChannelList,
			},

			{
				path: "/server/:servername/channel/:channelname",
				component: () => import("~/views/chat/channel/ChannelView.vue"),
				name: View.Channel,
			},

			{
				path: "/privates/",
				component: () =>
					import("~/views/chat/private/PrivateListView.vue"),
				name: View.PrivateList,
			},
			{
				path: "/private/:id",
				component: () => import("~/views/chat/private/PrivateView.vue"),
				name: View.Private,
			},

			{
				path: "/",
				component: () => import("~/views/chat/ChatView.vue"),
				name: View.Chat,
			},
		],
	},

	{
		path: "/settings",
		component: () => import("~/views/settings/SettingsView.vue"),
		name: View.Settings,
	},
];
