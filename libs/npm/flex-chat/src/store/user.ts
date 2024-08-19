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

// -------- //
// Constant //
// -------- //

const FETCH_OPTIONS: RequestInit = { credentials: "same-origin" };

// -------------- //
// Implémentation //
// -------------- //

export class UserStoreData
{
	/**
	 * Utilisateur connecté en session
	 */
	private _session: ChatStoreUserExt["_user"] = None();
	// users: Set<User> = new Set();

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	public get_session()
	{
		return this._session;
	}

	public set_session(session: UserSession)
	{
		this._session.replace(session);
	}

	public unset_session()
	{
		this._session = None();
	}
}

export class UserStore 
{
	// ------ //
	// Static //
	// ------ //

	static readonly NAME = "user-store";

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(private data: UserStoreData)
	{}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	public async disconnect()
	{
		const response = await fetch("/auth/logout", {
			...FETCH_OPTIONS,
			method: "DELETE",
		});

		if (response.ok) {
			this.data.unset_session();
			return response;
		}

		if (response.status >= 400 && response.status < 600) {
			return Promise.reject(await response.json());
		}

		return await Promise.reject(response);
	}

	public async fetch(): Promise<UserSession>
	{
		let response = await fetch("/api/v1/users/@me", FETCH_OPTIONS);

		if (response.ok) {
			return response.json();
		}

		if (response.status >= 400 && response.status < 600) {
			return Promise.reject(await response.json());
		}

		return Promise.reject(response);
	}

	public session(user?: UserSession): UserStoreData["_session"]
	{
		if (user) {
			this.data.set_session(user);
		}
		return this.data.get_session();
	}
}
