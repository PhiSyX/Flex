// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { formatDate } from "@phisyx/flex-date";

// ---- //
// Type //
// ---- //

type MessageProperties = {
	data: object & { origin: Origin };
	id: string;
	archived: boolean;
	message: string;
	isMe: boolean;
	nickname: string;
	target: string;
	time: {
		datetime: string;
		formattedTime: string;
	};
	type: "action" | `error:${string}` | "event" | `event:${string}` | "privmsg";
};

// -------- //
// Constant //
// -------- //

export const MESSAGES_LIMIT: number = 250;

// -------------- //
// Implémentation //
// -------------- //

export class RoomMessage {
	archived = false;
	declare data: MessageProperties["data"];
	declare id: MessageProperties["id"];
	declare message: MessageProperties["message"];
	isMe: MessageProperties["isMe"] = false;
	declare nickname: MessageProperties["nickname"];
	declare target: MessageProperties["target"];
	declare time: MessageProperties["time"];
	declare type: MessageProperties["type"];

	get isEventType(): boolean {
		return this.type.startsWith("event");
	}

	markAsArchived() {
		this.archived = true;
	}

	withData(data: this["data"]): this {
		this.data = data;
		return this;
	}

	withID(id: this["id"]): this {
		this.id = id;
		return this;
	}

	withIsMe(bool: boolean): this {
		this.isMe = bool;
		return this;
	}

	withMessage(message: this["message"]): this {
		this.message = message;
		return this;
	}

	withNickname(nickname: this["nickname"]): this {
		this.nickname = nickname;
		return this;
	}

	withTarget(target: this["target"]): this {
		this.target = target;
		return this;
	}

	withType(ty: this["type"]): this {
		this.type = ty;
		return this;
	}

	withTime(date: Date): this {
		const time = {
			datetime: date.toISOString(),
			formattedTime: formatDate("`H:i:s`", new Date()),
		};

		this.time = time;
		return this;
	}
}
