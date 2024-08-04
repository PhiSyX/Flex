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

export class ErrorNooperhostHandler
	implements SocketEventInterface<"ERR_NOOPERHOST">
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
		let active_room = this.store.room_manager().active();
		active_room.add_event(
			"error:err_nooperhost",
			{ ...data, isCurrentClient: false },
			data.reason,
		);
	}
}

export class ErrorPasswdmismatchHandler
	implements SocketEventInterface<"ERR_PASSWDMISMATCH">
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
		let active_room = this.store.room_manager().active();
		active_room.add_event(
			"error:err_passwdmismatch",
			{ ...data, isCurrentClient: false },
			data.reason,
		);
	}
}

export class ErrorOperonlyHandler
	implements SocketEventInterface<"ERR_OPERONLY">
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
		let active_room = this.store.room_manager().active();
		active_room.add_event(
			"error:err_operonly",
			{ ...data, isCurrentClient: false },
			data.reason,
		);
	}
}
