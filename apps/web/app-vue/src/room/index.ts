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
import { MESSAGES_LIMIT, RoomMessage } from "./message";

// -------- //
// Constant //
// -------- //

export const INPUT_HISTORY_LIMIT: number = 50;

// -------------- //
// Implémentation //
// -------------- //

export class Room<R = RoomID, Type extends string = string> {
	/**
	 * ID de la chambre.
	 */
	private _id!: R;

	/**
	 * Définit l'état de la chambre, active ou non.
	 */
	private active = false;

	/**
	 * Définit l'état de la chambre, fermée ou non.
	 */
	private closed = false;

	/**
	 * Nom personnalisé de la fenêtre.
	 */
	private customName: Option<R> = None();

	/**
	 * Chambre marqué comme étant "Highlight". Cela signifie que le client
	 * courant a été mentionné sur cette chambre.
	 */
	highlighted = false;

	/**
	 * Historique des champs de saisie de l'utilisateur.
	 */
	inputHistory: Array<string> = [];

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
		protected _name: R | string,
	) {}

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get lastMessage(): Option<RoomMessage> {
		return Option.from(this.messages.at(-1));
	}

	get name(): R {
		return this.customName.unwrap_or(this._name as NonNullable<R>);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	/**
	 * Ajoute un événement de connexion au tableau de messages.
	 */
	addConnectEvent(
		payload: {
			origin: Origin;
			tags: { msgid: string };
		},
		messageText: string,
	) {
		const message = new RoomMessage()
			.withID(payload.tags.msgid)
			.withType("event:connect")
			// NOTE(phisyx): Les événements de connexions n'ont pas besoin
			// d'être annotés d'un pseudonyme.
			.withNickname("*")
			.withMessage(messageText)
			.withTarget(this._name)
			.withTime(new Date())
			.withData(payload);
		this.addMessage(message);
	}

	/**
	 * Ajoute un événement d'erreur au tableau de messages.
	 */
	addErrorEvent(
		payload: {
			origin: Origin;
			tags: { msgid: string };
		},
		messageText: string,
	) {
		const message = new RoomMessage()
			.withID(payload.tags.msgid)
			.withType("event:error")
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
	addEvent<R extends RepliesNames>(
		evtName:
			| `error:${Lowercase<R>}`
			| `event:${Lowercase<R>}`
			| `error:${Uppercase<R>}`
			| `event:${Uppercase<R>}`,
		payload: GenericReply<Uppercase<R>> & { isCurrentClient: boolean },
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
			.withIsCurrentClient(payload.isCurrentClient);
		this.addMessage(msg);
	}

	/**
	 * Ajoute une entrée utilisateur dans l'historique des entrées.
	 */
	addInputHistory(input: string) {
		const inputHistorySize = this.inputHistory.length;

		if (inputHistorySize === INPUT_HISTORY_LIMIT) {
			this.inputHistory.shift();
		}

		if (inputHistorySize === 0) {
			this.inputHistory.push(input, "");
		} else {
			if (this.inputHistory[inputHistorySize - 2] !== input) {
				this.inputHistory[inputHistorySize - 1] = input;
				this.inputHistory.push("");
			}
		}
	}

	/**
	 * Ajoute un message au tableau de messages.
	 */
	addMessage(message: RoomMessage) {
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

	/**
	 * Définit un nom.
	 */
	changeName(name: string) {
		this._name = name;
	}

	/**
	 * Efface tous les messages
	 */
	clearMessages() {
		this.messages = [];
	}

	eq($1: string | this): boolean {
		if (typeof $1 === "string") {
			return (
				this.id() === $1 ||
				(this.name as string).toLowerCase() === $1.toLowerCase()
			);
		}
		return $1.id() === this.id();
	}

	/**
	 * ID de la chambre.
	 */
	id(): R {
		return this._id;
	}

	/**
	 * Définit un ID de chambre.
	 */
	withID(id: R): this {
		this._id = id;
		return this;
	}

	/**
	 * Est-ce que la chambre est active?
	 */
	isActive(): boolean {
		return this.active;
	}

	/**
	 * Est-ce que la chambre est fermée?
	 */
	isClosed(): boolean {
		return this.closed;
	}

	/**
	 * Marque la chambre comme étant fermée.
	 */
	marksAsClosed(): this {
		this.closed = true;
		this.active = false;
		for (const message of this.messages) {
			message.markAsArchived();
		}
		return this;
	}

	/**
	 * Marque la chambre comme étant ouverture.
	 */
	marksAsOpen(): this {
		this.closed = false;
		return this;
	}

	/**
	 * Définit la chambre comme étant active.
	 */
	setActive(b: boolean) {
		this.active = b;
	}

	/**
	 * Définit un nom personnalisé pour la chambre.
	 */
	setCustomName(name: NonNullable<R>) {
		this.customName.replace(name);
	}

	/**
	 * Définit la chambre comme étant "highlight".
	 */
	setHighlighted(bool: boolean) {
		this.highlighted = bool;
	}

	/**
	 * Définit le total des événements reçus à 0.
	 */
	unsetTotalUnreadEvents() {
		this.totalUnreadEvents = 0;
	}

	/**
	 * Définit le total des messages reçus à 0.
	 */
	unsetTotalUnreadMessages() {
		this.totalUnreadMessages = 0;
	}
}
