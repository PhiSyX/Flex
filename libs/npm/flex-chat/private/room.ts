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

export class PrivateRoom extends Room<UserID, "private"> {
	// ------ //
	// Static //
	// ------ //

	public static type = "private" as const;

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(name: string) {
		super(PrivateRoom.type, name);
	}

	// --------- //
	// Propriété //
	// --------- //

	closed = true;

	/**
	 * Liste des participant de la chambre privé.
	 */
	participants: Participants = new Map();

	/**
	 * Est-ce que le privé est en attente?
	 */
	private pending = true;

	// ------- //
	// Méthode // -> Override
	// ------- //

	override clear_messages() {
		if (!this.pending) {
			super.clear_messages();
		}
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute un participant à la chambre privé.
	 */
	add_participant(participant: PrivateParticipant | Origin) {
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
	del_participant(participant_id: string) {
		this.participants.delete(participant_id);
	}

	/**
	 * Récupère un participant de la chambre privé.
	 */
	get_participant(participant_id: string): Option<PrivateParticipant> {
		return Option.from(this.participants.get(participant_id));
	}

	/**
	 * Récupère un participant de la chambre privé.
	 */
	get_participant_unchecked(participant_id: string): PrivateParticipant {
		return this.get_participant(participant_id).unwrap_unchecked();
	}

	override is_readonly(): boolean {
		return this.is_pending() || super.is_readonly();
	}

	is_pending() {
		return this.pending;
	}

	set_pending(bool: boolean) {
		this.pending = bool;
	}
}
