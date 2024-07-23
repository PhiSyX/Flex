// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelRoom } from "@phisyx/flex-chat";
import type { ChatStore } from "~/store";

import { assertChannelRoom } from "@phisyx/flex-chat";

// -------------- //
// Implémentation //
// -------------- //

export class PartHandler implements SocketEventInterface<"PART"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("PART", (data) => this.handle(data));
	}

	handle(data: GenericReply<"PART">) {
		const maybeChannel = this.store.roomManager().get(data.channel);

		if (maybeChannel.is_none()) return;

		const channel = maybeChannel.unwrap();
		assertChannelRoom(channel);

		if (this.store.isCurrentClient(data.origin)) {
			this.handleClientItself(data, channel);
			return;
		}

		this.handleUser(data, channel);
	}

	handleClientItself(_: GenericReply<"PART">, channel: ChannelRoom) {
		this.store.roomManager().close(channel.name);
		// FIXME(phisyx): Définir la chambre courante à la chambre juste au
		// dessus ou en au dessous de la chambre venant d'être fermée.
		this.store.roomManager().setCurrentToLast();
	}

	handleUser(data: GenericReply<"PART">, channel: ChannelRoom) {
		channel.addEvent("event:part", { ...data, isCurrentClient: false });
		channel.removeMember(data.origin.id);
	}
}
