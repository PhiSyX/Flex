// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ChatStore } from "~/store/ChatStore";

// -------------- //
// Implémentation //
// -------------- //

export class ReplyWelcomeHandler implements SocketEventInterface<"RPL_WELCOME"> {
	constructor(private store: ChatStore) {}

	listen() {
		this.store.once("RPL_WELCOME", (data) => {
			this.handle(data, {
				channels: this.store.getAutoJoinChannels(),
			});
		});
	}

	handle(data: GenericReply<"RPL_WELCOME">, payload: { channels: Array<string> }) {
		const { channels } = payload;

		this.store.setConnected(true);
		this.store.setClientID(data.tags.client_id);
		this.store.setMe({
			id: data.tags.client_id,
			nickname: data.nickname,
			host: { cloaked: data.host },
			ident: data.ident,
		});

		const networkRoom = this.store.network();
		networkRoom.addConnectEvent(data, data.message);

		const module = this.store
			.moduleManager()
			.get("JOIN")
			.expect("Récupération du module `JOIN`");
		module.send({ channels });
	}
}
