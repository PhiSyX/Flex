// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { format_date } from "@phisyx/flex-date";

// ---- //
// Type //
// ---- //

// biome-ignore lint/suspicious/noExplicitAny: à corriger.
type MessageProperties<T = any, D = object> = {
	data: D & { origin: Origin };
	id: UUID;
	archived: boolean;
	formats: {
		bold: boolean | null;
		italic: boolean | null;
		underline: boolean | null;
	};
	colors: {
		background: number | null;
		foreground: number | null;
	};
	message: string;
	is_current_client: boolean;
	nickname: string;
	target: T;
	time: {
		datetime: string;
		formatted_time: string;
	};
	type:
		| "action"
		| `error:${string}`
		| "event"
		| `event:${string}`
		| "pubmsg"
		| "privmsg";
};

// -------- //
// Constant //
// -------- //

export const MESSAGES_LIMIT: number = 250;

// -------------- //
// Implémentation //
// -------------- //

export class RoomMessage<T = unknown, D = object>
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(message: RoomMessage["message"]) 
	{
		this.message = message;
		this.with_time(new Date());
	}

	// --------- //
	// Propriété //
	// --------- //

	archived = false;
	data!: MessageProperties<T, D>["data"];
	id!: MessageProperties["id"];
	formats!: MessageProperties["formats"];
	colors!: MessageProperties["colors"];
	is_current_client: MessageProperties["is_current_client"] = false;
	mention = false;
	message!: MessageProperties["message"];
	nickname!: MessageProperties["nickname"];
	target!: MessageProperties<T>["target"];
	time!: MessageProperties["time"];
	type!: MessageProperties["type"];


	// --------------- //
	// Getter | Setter //
	// --------------- //

	get is_event_type(): boolean
	{
		return this.type.startsWith("event");
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	mark_as_archived()
	{
		this.archived = true;
	}

	with_colors(colors: this["colors"]): this
	{
		this.colors = colors;
		return this;
	}

	with_data(data: this["data"]): this
	{
		this.data = data;
		return this;
	}

	with_formats(formats: this["formats"]): this
	{
		this.formats = formats;
		return this;
	}

	with_id(id: this["id"]): this
	{
		this.id = id;
		return this;
	}

	with_is_current_client(bool: boolean): this
	{
		this.is_current_client = bool;
		return this;
	}

	with_mention(bool: boolean): this
	{
		this.mention = bool;
		return this;
	}

	with_nickname(nickname: this["nickname"]): this
	{
		this.nickname = nickname;
		return this;
	}

	with_target(target: this["target"]): this
	{
		this.target = target;
		return this;
	}

	with_type(ty: this["type"]): this
	{
		this.type = ty;
		return this;
	}

	with_time(date: Date): this
	{
		let time = {
			datetime: date.toISOString(),
			formatted_time: format_date("`H:i:s`", date),
		};

		this.time = time;
		return this;
	}

	toString()
	{
		return this.message;
	}
}

export class RoomMessageEvent<R extends RepliesNames>
{
	data: GenericReply<Uppercase<R>>;
	name: this["data"]["name"];
	tags: this["data"]["tags"];
	origin: this["data"]["origin"];

	is_current_client: boolean;

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		data: RoomMessageEvent<R>["data"],
		is_current_client = true
	)
	{
		this.data = data;
		this.name = data.name;
		this.tags = data.tags;
		this.origin = data.origin;

		this.is_current_client = is_current_client;
	}
}