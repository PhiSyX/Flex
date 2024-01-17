// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ModelRef } from "vue";

import { advancedInfo, loginFormData } from "./state";

import { useChatStore } from "~/store/ChatStore";

const chatStore = useChatStore();

// ------- //
// Handler //
// ------- //

/**
 * Affiche les informations de connexion avancées.
 */
export function displayAdvancedInfoHandler() {
	advancedInfo.value = true;
}

/**
 * Soumission du formulaire. S'occupe de se connecter au serveur de Chat.
 */
export function connectSubmit(_model: ModelRef<boolean | undefined, string>) {
	function connectSubmitHandler(evt: Event) {
		evt.preventDefault();

		chatStore.connect(loginFormData);

		//chatStore.listen("RPL_WELCOME", () => {
		//	model.value = true;
		//});
	}

	return connectSubmitHandler;
}
