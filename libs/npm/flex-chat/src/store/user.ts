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

import type { User } from "../user";
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

// -------- //
// Constant //
// -------- //

const FETCH_OPTIONS: RequestInit = { credentials: "same-origin" };

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

	users: Set<User> = new Set();

	disconnect()
	{
		return fetch("/auth/logout", {...FETCH_OPTIONS, method: "DELETE" }).then(async (res) => {
			if (res.ok) {
				this._session = None();
				return res;
			}

			if (res.status >= 400 && res.status < 600) {
				return Promise.reject(await res.json());
			}

			return Promise.reject(res);
		});
	}

	fetch(): Promise<UserSession>
	{
		return fetch("/api/v1/users/@me", FETCH_OPTIONS).then(async (res) => {
			if (res.ok) {
				return res.json();
			}

			if (res.status >= 400 && res.status < 600) {
				return Promise.reject(await res.json());
			}

			return Promise.reject(res);
		});
	}
	
	session(user?: UserSession): this["_session"]
	{
		if (user) {
			this._session.replace(user);
		}
		return this._session;
	}
}
