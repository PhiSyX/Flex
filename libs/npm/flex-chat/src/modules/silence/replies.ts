// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface, ChatStoreUUIDExt } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class ReplySilenceHandler implements SocketEventInterface<"SILENCE">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface & ChatStoreUUIDExt)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("SILENCE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"SILENCE">)
	{
		let room = this.store.room_manager().active();

		if (data.updated) {
			let message = "Votre liste des utilisateurs ignorés a été mis à jour";
			let [random_uuid] = this.store.uuid(7).take(1);
			data.tags.msgid = random_uuid;
			room.add_connect_event(data, message);
		}

		for (let user of data.users) {
			if (data.added) {
				this.store.user_manager().add_to_block(user.id);
			}

			if (data.removed) {
				this.store.user_manager().remove_to_block(user.id);
			}

			if (data.updated) {
				let [random_uuid] = this.store.uuid(7).take(1);
				data.tags.msgid = random_uuid;
				room.add_event("event:silence", room.create_event(data));
			}
		}
	}
}
