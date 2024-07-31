// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assertChannelRoom, isChannel } from "../../asserts/room";
import type { ChannelRoom } from "../../channel/room";
import { NoticeCustomRoom } from "../../custom_room/notice";
import type { RoomMessage } from "../../room/message";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class NoticeHandler implements SocketEventInterface<"NOTICE"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("NOTICE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"NOTICE">) {
		const isCurrentClient = this.store.isCurrentClient(data.origin);
		const activeRoom = this.store.roomManager().active();

		const payload = { ...data, isCurrentClient };
		const message = activeRoom.addEvent("event:notice", payload);

		if (
			!isCurrentClient ||
			(isCurrentClient && isChannel(payload.target))
		) {
			const noticeRoom = this.store
				.roomManager()
				.getOrInsert(NoticeCustomRoom.ID, () => new NoticeCustomRoom());

			if (activeRoom.id() !== NoticeCustomRoom.ID) {
				noticeRoom.addEvent("event:notice", payload);
			}
		}

		// NOTE: envoie la notice dans le panel d'activité du salon.
		if (!isCurrentClient && isChannel(payload.target)) {
			const maybeChannel = this.store.roomManager().get(payload.target);

			if (maybeChannel.is_some()) {
				const channel = maybeChannel.unwrap();
				assertChannelRoom(channel);
				this.handleChannel(channel, payload, message);
			}
		}
	}

	handleChannel(
		channel: ChannelRoom,
		payload: GenericReply<"NOTICE"> & { isCurrentClient: boolean },
		message: RoomMessage,
	) {
		channel.activities.append("notice", {
			channelID: channel.id(),
			nickname: payload.origin.nickname,
			messageID: message.id,
		});
	}
}
