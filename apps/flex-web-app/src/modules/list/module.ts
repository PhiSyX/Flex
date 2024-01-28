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
import { ListCommand } from "./command";
import { ReplyListHandler, ReplyListendHandler, ReplyListstartHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class ListModule implements Module<ListModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "LIST";

	static create(store: ChatStore): ListModule {
		return new ListModule(
			new ListCommand(store),
			new ReplyListHandler(store),
			new ReplyListstartHandler(store),
			new ReplyListendHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: ListCommand,
		private numericListHandler: ReplyListHandler,
		private numericListstartHandler: ReplyListstartHandler,
		private numericListendHandler: ReplyListendHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input() {
		this.command.send({});
	}

	send(payload: Command<"LIST">) {
		this.command.send(payload);
	}

	listen() {
		this.numericListHandler.listen();
		this.numericListstartHandler.listen();
		this.numericListendHandler.listen();
	}
}
