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
                path: "/channels",
                component: () => import("~/views/chat/channel/ChannelListView.vue"),
                name: View.ChannelList,
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
    }
];
