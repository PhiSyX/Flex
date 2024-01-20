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
	declare _id: RoomID;

	/**
	 * Définit l'état de la fenêtre, active ou non.
	 */
	private active = false;

	/**
	 * Nom personnalisé de la fenêtre.
	 */
	private customName: Option<string> = None();

	/**
	 * TODO: trouver une meilleur nomenclature.
	 * Highlight de la chambre
	 */
	highlight = false;

	/**
	 * Les messages liées à la fenêtre.
	 *
	 * La taille maximale des messages est définit par la constante
	 * [MESSAGES_LIMIT].
	 */
	messages: Array<RoomMessage> = [];

	/**
	 * Le total des événements reçus.
	 */
	totalUnreadEvents = 0;

	/**
	 * Le total des messages reçus.
	 */
	totalUnreadMessages = 0;

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		public type: Type,
		protected _name: string,
	) {
		this._id = _name.toLowerCase();
		this.customName.replace(_name);
	}

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get lastMessage(): Option<RoomMessage> {
		return Option.from(this.messages.at(-1));
	}

	get name(): string {
		return this.customName.unwrap_or(this._name);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	/**
	 * Ajoute un événement de connexion au tableau de messages.
	 */
	public addConnectEvent(
		payload: {
			origin: Origin;
			tags: { msgid: string };
		},
		messageText: string,
	) {
		const message = new RoomMessage()
			.withID(payload.tags.msgid)
			.withType("event:connect")
			.withNickname("*")
			.withMessage(messageText)
			.withTarget(this._name)
			.withTime(new Date())
			.withData(payload);
		this.addMessage(message);
	}

	/**
	 * Ajoute un événement au tableau de messages.
	 */
	public addEvent<R extends RepliesNames>(
		evtName:
			| `error:${Lowercase<R>}`
			| `event:${Lowercase<R>}`
			| `error:${Uppercase<R>}`
			| `event:${Uppercase<R>}`,
		payload: GenericReply<Uppercase<R>> & { isMe: boolean },
		messageText?: string,
	) {
		const msg = new RoomMessage()
			.withData(payload)
			.withID(payload.tags.msgid)
			.withMessage(messageText || evtName)
			.withNickname(payload.origin.nickname)
			.withTarget(this.id())
			.withTime(new Date())
			.withType(evtName)
			.withIsMe(payload.isMe);
		this.addMessage(msg);
	}

	/**
	 * Ajoute un message au tableau de messages.
	 */
	public addMessage(message: RoomMessage) {
		if (this.messages.length === MESSAGES_LIMIT) {
			this.messages.shift();
		}

		this.messages.push(message);

		if (!this.active) {
			if (message.type.startsWith("event")) {
				this.totalUnreadEvents += 1;
			} else {
				this.totalUnreadMessages += 1;
			}
		}
	}

	eq($1: string | Room<Type>): boolean {
		if (typeof $1 === "string") {
			return (
				this.id.toString().toLowerCase() === $1.toLowerCase() ||
				this.name.toLowerCase() === $1.toLowerCase()
			);
		}
		return $1.id === this.id;
	}

	/**
	 * ID de la chambre.
	 */
	public id(): RoomID {
		return this._id;
	}

	/**
	 * Est-ce que la chambre est active?
	 */
	public isActive(): boolean {
		return this.active;
	}

	/**
	 * Définit la chambre comme étant active.
	 */
	public setActive(b: boolean) {
		this.active = b;
	}

	/**
	 * Définit la chambre comme étant "highlight".
	 */
	public setHighlight(bool: boolean) {
		this.highlight = bool;
	}

	/**
	 * Définit le total des événements reçus à 0.
	 */
	public unsetTotalUnreadEvents() {
		this.totalUnreadEvents = 0;
	}

	/**
	 * Définit le total des messages reçus à 0.
	 */
	public unsetTotalUnreadMessages() {
		this.totalUnreadMessages = 0;
	}
}
