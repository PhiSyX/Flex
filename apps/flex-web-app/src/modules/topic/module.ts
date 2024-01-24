// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ChatStore } from "~/store/ChatStore";

import { Module } from "../interface";
import { TopicCommand } from "./command";
import { ReplyNotopicHandler, ReplyTopicHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class TopicModule implements Module<TopicModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "TOPIC";

	static create(store: ChatStore): TopicModule {
		return new TopicModule(
			new TopicCommand(store),
			new ReplyTopicHandler(store),
			new ReplyNotopicHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: TopicCommand,
		private numericTopicHandler: ReplyTopicHandler,
		private numericNoTopicHandler: ReplyNotopicHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(channel?: string, ...words: Array<string>) {
		if (!channel) return;
		const topic = words.join(" ");
		this.send({ channel, topic });
	}

	send(payload: Command<"TOPIC">) {
		this.command.send(payload);
	}

	listen() {
		this.numericTopicHandler.listen();
		this.numericNoTopicHandler.listen();
	}
}
