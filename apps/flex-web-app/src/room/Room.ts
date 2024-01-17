// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Option } from "@phisyx/flex-safety";
import { Origin } from "~/types/replies";
import { MESSAGES_LIMIT, RoomMessage } from "./RoomMessage";

// ---- //
// Type //
// ---- //

export type RoomID = string;

// -------------- //
// Implémentation //
// -------------- //

export class Room<Type extends string = string> {
	/**
	 * ID de la chambre.
	 */
	#id: RoomID;

	/**
	 * Définit l'état de la fenêtre, active ou non.
	 */
	private active = false;

	/**
	 * Nom personnalisé de la fenêtre.
	 */
	private customName: Option<string> = None();

	/**
	 * Les messages liées à la fenêtre.
	 *
	 * La taille maximale des messages est définit par la constante
	 * [MESSAGES_LIMIT].
	 */
	private messages: Array<RoomMessage> = [];

	/**
	 * Le total des événements reçus.
	 */
	total_unread_events = 0;

	/**
	 * Le total des messages reçus.
	 */
	total_unread_messages = 0;

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		public type: Type,
		public name: string,
	) {
		this.#id = name.toLowerCase();
		this.customName.replace(name);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	/**
	 * Ajoute un événement de connexion à la liste des messages de la chambre.
	 */
	public addConnectEvent(
		payload: {
			origin: Origin;
			tags: { msgid: string };
		},
		message_text: string,
	) {
		const message = new RoomMessage()
			.withID(payload.tags.msgid)
			.withType("event:connect")
			.withNickname(payload.origin.nickname)
			.withMessage(message_text)
			.withTarget(this.name)
			.withTime(new Date())
			.withData(payload);
		this.addMessage(message);
	}

	/**
	 * Ajoute un message au tableau de messages.
	 */
	public addMessage(message: RoomMessage): void {
		if (this.messages.length === MESSAGES_LIMIT) {
			this.messages.shift();
		}

		this.messages.push(message);

		if (!this.active) {
			if (message.type.startsWith("event")) {
				this.total_unread_events += 1;
			} else {
				this.total_unread_messages += 1;
			}
		}
	}

	/**
	 * ID de la chambre.
	 */
	public id(): RoomID {
		return this.#id;
	}

	/**
	 * Définit la chambre comme étant active.
	 */
	public setActive(b: boolean) {
		this.active = b;
	}
}
