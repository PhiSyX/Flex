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

import { is_participant } from "../asserts/participant";
import { PrivateParticipant } from "../private/participant";
import { Room } from "../room";

// ---- //
// Type //
// ---- //

export type Participants = Map<string, PrivateParticipant>;

// -------------- //
// Implémentation //
// -------------- //

export class PrivateRoom extends Room<UserID, "private">
{
	/**
	 * Liste des participant de la chambre privé.
	 */
	participants: Participants = new Map();

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(name: string)
	{
		super("private", name);
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute un participant à la chambre privé.
	 */
	add_participant(participant: PrivateParticipant | Origin)
	{
		if (is_participant(participant)) {
			this.participants.set(participant.id, participant);
		} else {
			let new_participant = new PrivateParticipant(participant);
			this.participants.set(participant.id, new_participant);
		}
	}

	/**
	 * Supprime un participant de la chambre privé.
	 */
	del_participant(participant_id: string)
	{
		this.participants.delete(participant_id);
	}

	/**
	 * Récupère un participant de la chambre privé.
	 */
	get_participant(id: string): Option<PrivateParticipant>
	{
		return Option.from(this.participants.get(id));
	}
}
