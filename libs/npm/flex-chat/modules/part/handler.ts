// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assert_channel_room } from "../../asserts/room";
import type { ChannelRoom } from "../../channel/room";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class PartHandler implements SocketEventInterface<"PART"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("PART", (data) => this.handle(data));
	}

	handle(data: GenericReply<"PART">) {
		let maybe_channel = this.store.room_manager().get(data.channel);

		if (maybe_channel.is_none()) {
			return;
		}

		let channel = maybe_channel.unwrap();
		assert_channel_room(channel);

		if (this.store.is_current_client(data.origin)) {
			this.handle_client_itself(data, channel);
			return;
		}

		this.handle_user(data, channel);
	}

	handle_client_itself(_: GenericReply<"PART">, channel: ChannelRoom) {
		this.store.room_manager().close(channel.name);
		// FIXME(phisyx): Définir la chambre courante à la chambre juste au
		// dessus ou en au dessous de la chambre venant d'être fermée.
		this.store.room_manager().set_current_to_last();
	}

	handle_user(data: GenericReply<"PART">, channel: ChannelRoom) {
		channel.add_event("event:part", channel.create_event(data, false));
		channel.remove_member(data.origin.id);
	}
}
