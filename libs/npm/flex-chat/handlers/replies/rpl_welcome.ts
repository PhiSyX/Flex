// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface, ChatStoreInterfaceExt } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class ReplyWelcomeHandler
	implements SocketEventInterface<"RPL_WELCOME">
{
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	listen() {
		this.store.once("RPL_WELCOME", (data) => {
			this.handle(data, {
				channels: this.store.get_auto_join_channels(),
			});
		});
	}

	handle(
		data: GenericReply<"RPL_WELCOME">,
		payload: { channels: Array<ChannelID> },
	) {
		let { channels } = payload;

		this.store.set_client({
			id: data.tags.client_id,
			nickname: data.nickname,
			host: { cloaked: data.host },
			ident: data.ident,
		});

		this.store.set_connected(true);

		let token_data = {
			nick: data.nickname,
			ident: data.ident,
			host: data.host,
			client_id: data.tags.client_id,
			token: data.tags.token,
		};

		fetch("/chat/connect/token", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(token_data),
		});

		let room = this.store.network();
		room.add_connect_event(data, data.message);

		let module = this.store
			.module_manager()
			.get("JOIN")
			.expect("Récupération du module `JOIN`");
		module.send({ channels });

		this.store.play_audio("connection");
	}
}
