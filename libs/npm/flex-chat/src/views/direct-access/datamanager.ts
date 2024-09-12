// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";

import type { DialogArgs, DialogClass, DialogInterface } from "../../dialogs";
import type { ChatStoreInterface, ChatStoreInterfaceExt } from "../../store";
import type { UserSession } from "../../user/session";
import type { DirectAccessFormData } from "./formdata";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessDataManager
{
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt)
	{}

	connect(
		form_data: DirectAccessFormData,
		response: {
			welcome: () => void;
			nicknameinuse: (
				error: GenericErrorReply<"ERR_NICKNAMEINUSE">,
			) => void;
		},
	)
	{
		this.store.connect(form_data);

		this.store.listen("RPL_WELCOME", () => response.welcome(), {
			once: true,
		});

		this.store.listen("ERR_NICKNAMEINUSE", (data) =>
			response.nicknameinuse(data),
		);
	}

	async load_all_modules()
	{
		return this.store.load_all_modules();
	}

	create_dialog<
		D extends DialogClass<DialogInterface<R>>,
		R,
	>(dialog: D, ...args: DialogArgs<D, R>)
	{
		dialog.create(this.store.overlayer(), ...args);
	}

	get_user_session(): Option<UserSession>
	{
		return this.store.user().session();
	}

	send_active_room(message: string)
	{
		this.store.send_message(
			this.store.room_manager().active().id(),
			message,
		);
	}
}