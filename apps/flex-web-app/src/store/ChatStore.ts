// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { defineStore } from "pinia";

// ---- //
// Type //
// ---- //

type ConnectUserInfo = {
	channels: string;
	alternativeNickname: string;
	nickname: string;
	passwordServer: string | null;
	realname: string;
	websocketServerURL: string;
};

// -------------- //
// Implémentation //
// -------------- //

class ChatStore {
	// ------ //
	// Static //
	// ------ //

	static readonly NAME = "chat-store";

	static default(): ChatStore {
		const self = new ChatStore();
		return self;
	}

	// --------- //
	// Propriété //
	// --------- //

	// -------- //
	// Fonction //
	// -------- //

	connectWebsocket(websocketServerURL: string) {
		console.info(
			"Connexion au serveur de WebSocket « %s »",
			websocketServerURL
		);
	}
}

export const useChatStore = defineStore(ChatStore.NAME, () => {
	const store = ChatStore.default();

	function connect(connectUserInfo: ConnectUserInfo) {
		store.connectWebsocket(connectUserInfo.websocketServerURL);

		const autoJoinChannels = connectUserInfo.channels.split(",");
		console.debug({ connectUserInfo, autoJoinChannels });
	}

	return { connect };
});
