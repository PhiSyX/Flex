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

import type { UserSession } from "../user/session";

import { None } from "@phisyx/flex-safety";

// ---- //
// Type //
// ---- //

export interface ChatStoreUserExt 
{
	_user: Option<UserSession>;

	user(): this["_user"];
}

// -------------- //
// Implémentation //
// -------------- //

export class UserStore 
{
	// ------ //
	// Static //
	// ------ //

	static ID = "user-store";

	// --------- //
	// Propriété //
	// --------- //

	_session: ChatStoreUserExt["_user"] = None();

	set(user: UserSession)
	{
		this._session.replace(user);
	}

	get(): this["_session"]
	{
		return this._session;
	}

	fetch(): Promise<UserSession>
	{
		let fetch_options: RequestInit = { credentials: "same-origin" };

		return fetch("/api/v1/users/@me", fetch_options).then(async (res) => {
			if (res.ok) {
				return res.json();
			}

			if (res.status >= 400 && res.status < 600) {
				return Promise.reject(await res.json());
			}

			return Promise.reject(res);
		});
	}
}
