// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class ReplySilenceHandler implements SocketEventInterface<"SILENCE">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("SILENCE", (data) => this.handle(data));
	}

	// NOTE(phisyx): la propriété `msgid` est redéfini pour éviter d'avoir des
	// doublons dans les listes pour Vue (à cause de l'attribut `key`) étant
	// donnée qu'on se base sur le même ID pour afficher deux messages
	// différents. Cela n'est pas dérangeant de le redéfinir pour cet événement.
	handle(data: GenericReply<"SILENCE">)
	{
		let active_room = this.store.room_manager().active();

		if (data.updated) {
			let message = "Votre liste des utilisateurs ignorés a été mis à jour";
			active_room.add_connect_event(
				{
					...data,
					// Voir NOTE ci-haut.
					tags: { ...data.tags, msgid: `${data.tags.msgid}#1` },
				},
				message,
			);
		}

		for (let user of data.users) {
			if (data.added) {
				this.store.user_manager().add_to_block(user.id);
			}

			if (data.removed) {
				this.store.user_manager().remove_to_block(user.id);
			}

			if (data.updated) {
				active_room.add_event("event:silence", {
					...data,
					// Voir NOTE ci-haut.
					tags: { ...data.tags, msgid: `${data.tags.msgid}#2` },
					isCurrentClient: true,
				});
			}
		}
	}
}
