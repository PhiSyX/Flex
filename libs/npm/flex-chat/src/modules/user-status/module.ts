// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface } from "../../store";
import type { Module } from "../interface";
import { AwayCommand } from "./command";

// -------------- //
// Implémentation //
// -------------- //

export class AwayModule implements Module<AwayModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "AWAY";

	static create(store: ChatStoreInterface): AwayModule {
		return new AwayModule(new AwayCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AwayCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, ...text: Array<string>)
	{
		this.send({ text: text.join(" ") });
	}

	send(payload: Command<"AWAY">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class BackModule implements Module<BackModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "BACK";

	static create(store: ChatStoreInterface): BackModule {
		return new BackModule(new AwayCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AwayCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string)
	{
		this.send({ text: "" });
	}

	send(payload: Command<"AWAY">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}
