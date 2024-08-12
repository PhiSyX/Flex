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

export class InviteHandler implements SocketEventInterface<"INVITE">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("INVITE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"INVITE">)
	{
		let room = this.store.room_manager()
			.get(data.channel, {
				where: {
					state: "opened",
					is_kicked: false,
				},
				fallbacks: [
					{
						active: {
							where: {
								is_kicked: false,
								is_custom: false,
							},
						},
					},
					{
						latest: {
							where: {
								is_kicked: false,
								is_custom: false,
							},
						},
					},
					{
						network: true,
					}
				]
			})
			.unwrap();

		room.add_event(
			"event:invite", 
			room.create_event(data, this.store.is_current_client(data.origin)),
		);

		this.store.play_audio("invite");
	}
}
