// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Option } from "@phisyx/flex-safety";

import type { PrivateParticipant } from "~/private/PrivateParticipant";

import { Room } from "~/room/Room";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateRoom extends Room<UserID, "private"> {
	/**
	 * Liste des participant de la chambre privé.
	 */
	participants: Map<string, PrivateParticipant> = new Map();

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(name: string) {
		super("private", name);
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute un participant à la chambre privé.
	 */
	addParticipant(participant: PrivateParticipant) {
		this.participants.set(participant.id, participant);
	}

	/**
	 * Récupère un participant de la chambre privé.
	 */
	getParticipant(id: string): Option<PrivateParticipant> {
		return Option.from(this.participants.get(id));
	}
}
