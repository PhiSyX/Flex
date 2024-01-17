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
import { GenericReply } from "~/types/replies";
import { SocketEventInterface } from "~/types/socket";

// -------------- //
// Implémentation //
// -------------- //

export class ReplyWelcomeHandler
	implements SocketEventInterface<"RPL_WELCOME">
{
	constructor(private store: ChatStore) {}

	listen() {
		this.store.once("RPL_WELCOME", (data) => {
			this.handle(data, {
				channels: this.store.getAutoJoinChannels(),
			});
		});
	}

	handle(
		data: GenericReply<"RPL_WELCOME">,
		payload: { channels: Array<string> },
	) {
		const { channels } = payload;

		this.store.setConnected(true);
		this.store.setClientID(data.tags.client_id);
		this.store.setMe({
			nickname: data.nickname,
			host: { cloaked: data.host },
			ident: data.ident,
		});

		const network_room = this.store.network();
		network_room.addConnectEvent(data, data.message);

		// TODO: Join Channels
		console.debug("RPL_WELCOME", { channels });
	}
}
