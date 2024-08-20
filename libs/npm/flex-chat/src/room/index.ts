// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { is_string } from "@phisyx/flex-asserts";
import { None, Option, Some } from "@phisyx/flex-safety";

import { MESSAGES_LIMIT, RoomMessage, RoomMessageEvent } from "./message";

// -------- //
// Constant //
// -------- //

export const INPUT_HISTORY_LIMIT: number = 50;

// -------------- //
// Implémentation //
// -------------- //

export class Room<R = RoomID, Type extends string = string> 
{
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
	protected closed = false;

	/**
	 * Nom personnalisé de la fenêtre.
	 */
	private custom_name: Option<R> = None();

	declare created_at: Date;

	/**
	 * Chambre marqué comme étant "Highlight". Cela signifie que le client
	 * courant a été mentionné sur cette chambre.
	 */
	highlighted = false;

	/**
	 * Historique des champs de saisie de l'utilisateur.
	 */
	input_history: Array<string> = [];

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
	total_unread_events = 0;

	/**
	 * Le total des mentions reçues.
	 */
	total_unread_mentions = 0;

	/**
	 * Le total des messages reçus.
	 */
	total_unread_messages = 0;

	/**
	 * Droit d'écriture.
	 */
	writable = true;

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		public type: Type,
		protected _name: R | string,
	)
	{
		this.created_at = new Date();
	}

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get last_message(): Option<RoomMessage>
	{
		return Option.from(this.messages.at(-1));
	}

	get name(): R
	{
		return this.custom_name.unwrap_or(this._name as NonNullable<R>);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	/**
	 * Ajoute un événement de connexion au tableau de messages.
	 */
	add_connect_event(
		payload: {
			origin: Origin;
			tags: { msgid: UUID };
		},
		message_text: string,
	): Option<RoomMessage>
	{
		let message = new RoomMessage(message_text)
			.with_id(payload.tags.msgid)
			.with_type("event:connect")
			// NOTE(phisyx): Les événements de connexions n'ont pas besoin
			// d'être annotés d'un pseudonyme.
			.with_nickname("*")
			.with_target(this._name)
			.with_data(payload);
		return this.add_message(message);
	}

	/**
	 * Ajoute un événement d'erreur au tableau de messages.
	 */
	add_error_event(
		payload: {
			origin: Origin;
			tags: { msgid: UUID };
		},
		message_text: string,
	): Option<RoomMessage>
	{
		let message = new RoomMessage(message_text)
			.with_id(payload.tags.msgid)
			.with_type("event:error")
			.with_nickname("*")
			.with_target(this._name)
			.with_data(payload);
		return this.add_message(message);
	}

	/**
	 * Ajoute un événement au tableau de messages.
	 */
	add_event<R extends RepliesNames>(
		event_name:
			| `error:${Lowercase<R>}`
			| `event:${Lowercase<R>}`
			| `error:${Uppercase<R>}`
			| `event:${Uppercase<R>}`,
		event: RoomMessageEvent<R>,
		message_text?: string,
	): RoomMessage
	{
		let message = new RoomMessage(message_text || event_name)
			.with_data(event.data)
			.with_id(event.tags.msgid)
			.with_nickname(event.origin.nickname)
			.with_target(this.id())
			.with_type(event_name)
			.with_is_current_client(event.is_current_client);
		this.add_message(message);
		return message;
	}

	/**
	 * Ajoute une entrée utilisateur dans l'historique des entrées.
	 */
	add_input_history(input: string)
	{
		let input_history_size = this.input_history.length;

		if (input_history_size === INPUT_HISTORY_LIMIT) {
			this.input_history.shift();
		}

		if (input_history_size === 0) {
			this.input_history.push(input, "");
		} else {
			if (this.input_history[input_history_size - 2] !== input) {
				this.input_history[input_history_size - 1] = input;
				this.input_history.push("");
			}
		}
	}

	/**
	 * Ajoute un message au tableau de messages.
	 */
	add_message(message: RoomMessage): Option<RoomMessage>
	{
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

		return Some(message);
	}

	/**
	 * Définit un nom.
	 */
	change_name(name: string)
	{
		this._name = name;
	}

	/**
	 * Efface tous les messages
	 */
	clear_messages()
	{
		this.messages = [];
	}

	create_event<T extends RepliesNames>(
		data: RoomMessageEvent<T>["data"],
		is_current_client = true
	): RoomMessageEvent<T>
	{
		return new RoomMessageEvent(data, is_current_client);
	}

	eq($1: string | this): boolean
	{
		if (is_string($1)) {
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
	id(): R
	{
		return this._id;
	}

	/**
	 * Retourne un message parmi la liste des messages en fonction d'un ID.
	 */
	// NOTE: Même si un message a été envoyé au salon, le message peut être ne
	// pas être trouvé, car: les messages sauvegardés sont limités à 250
	// messages par salons.
	get_message<D extends object>(
		id: RoomMessage<R, D>["id"],
	): Option<RoomMessage<R, D>>
	{
		return Option.from(this.messages.find((msg) => msg.id === id)).as<
			RoomMessage<R, D>
		>();
	}

	/**
	 * Définit un ID de chambre.
	 */
	with_id(id: R): this
	{
		this._id = id;
		return this;
	}

	/**
	 * Est-ce que la chambre est active?
	 */
	is_active(): boolean
	{
		return this.active;
	}

	/**
	 * Est-ce que la chambre est fermée?
	 */
	is_closed(): boolean
	{
		return this.closed === true;
	}

	/**
	 * Est-ce que la chambre est en lecture seule
	 */
	is_readonly(): boolean
	{
		return !this.writable;
	}

	/**
	 * Englobe l'instance dans un type Option.Some
	 */
	into_some(): Option<this>
	{
		return Some(this);
	}

	/**
	 * Marque la chambre comme étant fermée.
	 */
	marks_as_closed(): this
	{
		this.closed = true;
		this.active = false;
		for (let message of this.messages) {
			message.mark_as_archived();
		}
		return this;
	}

	/**
	 * Marque la chambre comme étant ouverte.
	 */
	marks_as_opened(): this
	{
		this.closed = false;
		return this;
	}

	/**
	 * Marque la chambre en lecture seule.
	 */
	marks_as_readonly()
	{
		this.writable = false;
	}

	/**
	 * Marque la chambre en écriture.
	 */
	marks_as_writable()
	{
		this.writable = true;
	}

	/**
	 * Définit la chambre comme étant active.
	 */
	set_active(b: boolean)
	{
		this.active = b;
	}

	/**
	 * Définit un nom personnalisé pour la chambre.
	 */
	set_custom_name(name: NonNullable<R>)
	{
		this.custom_name.replace(name);
	}

	/**
	 * Définit la chambre comme étant "highlight".
	 */
	set_highlighted(bool: boolean)
	{
		if (bool) {
			this.total_unread_mentions += 1;
		}
		this.highlighted = bool;
	}

	/**
	 * Définit le total des événements reçus à 0.
	 */
	unset_total_unread_events()
	{
		this.total_unread_events = 0;
	}

	/**
	 * Définit le total des mentions reçues à 0.
	 */
	unset_total_unread_mentions()
	{
		this.total_unread_mentions = 0;
	}

	/**
	 * Définit le total des messages reçus à 0.
	 */
	unset_total_unread_messages()
	{
		this.total_unread_messages = 0;
	}
}
