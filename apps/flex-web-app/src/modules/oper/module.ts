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
import { OperCommand } from "./command";
import {
	ErrorNooperhostHandler,
	ErrorOperonlyHandler,
	ErrorPasswdmismatchHandler,
	OperHandler,
} from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class OperModule implements Module<OperModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "OPER";

	static create(store: ChatStore): OperModule {
		return new OperModule(
			new OperCommand(store),
			new OperHandler(store),
			new ErrorNooperhostHandler(store),
			new ErrorOperonlyHandler(store),
			new ErrorPasswdmismatchHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: OperCommand,
		private handler: OperHandler,
		private numericErrorNooperhostHandler: ErrorNooperhostHandler,
		private numericErrorOperonlyHandler: ErrorOperonlyHandler,
		private numericErrorPasswdmismatchHandler: ErrorPasswdmismatchHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(name?: string, password?: string) {
		if (!name || !password) {
			return;
		}

		this.send({ name, password });
	}

	send(payload: Command<"OPER">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
		this.numericErrorNooperhostHandler.listen();
		this.numericErrorOperonlyHandler.listen();
		this.numericErrorPasswdmismatchHandler.listen();
	}
}
