// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStore } from "~/storage/memory/chat";

// -------------- //
// Implémentation //
// -------------- //

export class ReplySilenceHandler implements SocketEventInterface<"SILENCE"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("SILENCE", (data) => this.handle(data));
	}

	// NOTE(phisyx): la propriété `msgid` est redéfini pour éviter d'avoir des
	// doublons dans les listes pour Vue (à cause de l'attribut `key`) étant
	// donnée qu'on se base sur le même ID pour afficher deux messages
	// différents. Cela n'est pas dérangeant de le redéfinir pour cet événement.
	handle(data: GenericReply<"SILENCE">) {
		const currentRoom = this.store.roomManager().active();

		if (data.updated) {
			const message =
				"Votre liste des utilisateurs ignorés a été mis à jour";
			currentRoom.addConnectEvent(
				{
					...data,
					// Voir NOTE ci-haut.
					tags: { ...data.tags, msgid: `${data.tags.msgid}#1` },
				},
				message,
			);
		}

		for (const user of data.users) {
			if (data.added) {
				this.store.userManager().addToBlock(user.id);
			}

			if (data.removed) {
				this.store.userManager().removeToBlock(user.id);
			}

			if (data.updated) {
				currentRoom.addEvent("event:silence", {
					...data,
					// Voir NOTE ci-haut.
					tags: { ...data.tags, msgid: `${data.tags.msgid}#2` },
					isCurrentClient: true,
				});
			}
		}
	}
}
