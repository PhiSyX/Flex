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

import { ChannelJoinDialog } from "../../dialogs/channel_join";

// ---- //
// Type //
// ---- //

type S = SocketEventInterface<"ERR_BADCHANNELKEY">;

// -------------- //
// Implémentation //
// -------------- //

export class ErrorBadchannelkeyHandler implements S {
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	listen() {
		this.store.on("ERR_BADCHANNELKEY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_BADCHANNELKEY">) {
		let room = this.store
			.room_manager()
			.get(data.channel, {
				where: {
					state: "opened",
					is_kicked: false,
				},
				fallbacks: [
					{
						active: {
							where: { is_kicked: false },
						},
					},
					{ network: true },
				],
			})
			.unwrap();

		room.add_event(
			"error:err_badchannelkey",
			room.create_event(data),
			data.reason,
		);

		setTimeout(() => {
			ChannelJoinDialog.create(this.store.overlayer(), undefined, {
				keys: "",
				names: data.channel,
				marksKeysFieldAsError: true,
				withNotice: false,
			});
		}, 1_000);
	}
}
