// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Ref } from "vue";

import type { UserSession } from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";

import { onMounted as on_mounted } from "vue";

import { View } from "@phisyx/flex-chat";

export function use_check_auth(
    view: Ref<View>,
    user: Ref<Option<UserSession>>,
)
{
    on_mounted(() => {
        let fetch_options: RequestInit = { credentials: "same-origin" };

        fetch("/api/v1/users/@me", fetch_options)
            .then(async (res) => {
                if (res.ok) {
                    return res.json();
                }

                if (res.status >= 400 && res.status < 600) {
                    return Promise.reject(await res.json());
                }

                return Promise.reject(res);
            })
            .then((current_user: UserSession) => {
                view.value = View.DirectAccess;
                user.value.replace(current_user);
            });
    });
}