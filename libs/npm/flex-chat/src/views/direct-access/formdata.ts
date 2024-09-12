// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { RememberMeStorage } from "../../localstorage/remember_me";

// --------- //
// Interface //
// --------- //

interface DirectAccessFormDataInterface
{
	alternative_nickname: string;
	channels: ChannelID;
	nickname: string;
	password_server: string;
	password_user: string;
	realname: string;
	remember_me: RememberMeStorage;
	websocket_server_url: string;
}

// --------- //
// Structure //
// --------- //

export class DirectAccessFormData implements DirectAccessFormDataInterface
{
	declare alternative_nickname: string;
	declare channels: ChannelID;
	declare nickname: string;
	declare password_server: string;
	declare password_user: string;
	declare realname: string;
	remember_me: RememberMeStorage = new RememberMeStorage();
	declare websocket_server_url: string;

	default(data: DirectAccessFormDataInterface)
	{
		for (let [key, value] of Object.entries(data)) {
			// @ts-expect-error : corriger le type.
			this[key] = value;
		}
	}

	set(data: Partial<DirectAccessFormDataInterface>)
	{
		for (let [key, value] of Object.entries(data)) {
			// @ts-expect-error : corriger le type.
			this[key] = value;
		}
	}
}
