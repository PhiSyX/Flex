// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { reactive, ref } from "vue";
import { RememberMeStorage } from "~/storage/RememberMeStorage";

// ----------- //
// Local State //
// ----------- //

export const advancedInfo = ref(false);
export const loginFormData = reactive({
	alternativeNickname: import.meta.env.VITE_APP_NICKNAME
		? `${import.meta.env.VITE_APP_NICKNAME}_`
		: "",
	channels: import.meta.env.VITE_APP_CHANNELS || "",
	nickname: import.meta.env.VITE_APP_NICKNAME || "",
	realname: import.meta.env.VITE_APP_REALNAME || "Flex Web App",
	rememberMe: new RememberMeStorage(),
	passwordServer: import.meta.env.VITE_APP_PASSWORD_SERVER || null,
	websocketServerURL: import.meta.env.VITE_APP_WEBSOCKET_URL,
});
export const errors = reactive({
	nickname: null as string | null,
	alternativeNickname: null as string | null,
});
