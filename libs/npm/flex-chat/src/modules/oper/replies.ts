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

// ---- //
// Type //
// ---- //

type S1 = SocketEventInterface<"ERR_NOOPERHOST">;
type S2 = SocketEventInterface<"ERR_PASSWDMISMATCH">;
type S3 = SocketEventInterface<"ERR_OPERONLY">;

// -------------- //
// Implémentation //
// -------------- //

export class ErrorNooperhostHandler implements S1
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("ERR_NOOPERHOST", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_NOOPERHOST">)
	{
		let room = this.store.room_manager().active();
		room.add_event(
			"error:err_nooperhost",
			room.create_event(data),
			data.reason,
		);
	}
}

export class ErrorPasswdmismatchHandler implements S2
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("ERR_PASSWDMISMATCH", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_PASSWDMISMATCH">)
	{
		let room = this.store.room_manager().active();
		room.add_event(
			"error:err_passwdmismatch",
			room.create_event(data),
			data.reason,
		);
	}
}

export class ErrorOperonlyHandler implements S3
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("ERR_OPERONLY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_OPERONLY">)
	{
		let room = this.store.room_manager().active();
		room.add_event(
			"error:err_operonly",
			room.create_event(data),
			data.reason,
		);
	}
}
