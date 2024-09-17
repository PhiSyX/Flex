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

export interface ChatStoreUserExt {
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

export class UserStoreData {
	/**
	 * Utilisateur connecté en session
	 */
	private _session: ChatStoreUserExt["_user"] = None();
	// users: Set<User> = new Set();

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	public get_session() {
		return this._session;
	}

	public set_session(session: UserSession) {
		this._session.replace(session);
	}

	public unset_session() {
		this._session = None();
	}
}

export class UserStore {
	// ------ //
	// Static //
	// ------ //

	static readonly NAME = "user-store";

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(private data: UserStoreData) {}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	public async disconnect() {
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

	public async fetch(): Promise<UserSession> {
		let response = await fetch("/api/v1/users/@me", FETCH_OPTIONS);

		if (response.ok) {
			return response.json();
		}

		if (response.status >= 400 && response.status < 600) {
			return Promise.reject(await response.json());
		}

		return Promise.reject(response);
	}

	public async patch(user_id: UUID, form_data: FormData) {
		let avatar = form_data.get("avatar") as File | null;

		let current_session = this.data.get_session().unwrap();

		if (!avatar || avatar.name.length === 0) {
			form_data.delete("avatar");
		} else {
			let form_data = new FormData();
			form_data.append("avatar", avatar);
			let response = await fetch(`/api/v1/avatars/${user_id}`, {
				...FETCH_OPTIONS,
				method: "PUT",
				body: form_data,
			});

			if (response.ok) {
				let data = (await response.json()) as { avatar: string };
				current_session.avatar = data.avatar;
			}

			// TODO: gérer les erreurs, via une alert ou autre.
			if (response.status >= 400 && response.status < 600) {
			}
		}

		let data = (await fetch(`/api/v1/accounts/${user_id}`, {
			...FETCH_OPTIONS,
			headers: {
				"Content-type": "application/json",
			},
			method: "PUT",
			body: JSON.stringify(Object.fromEntries(form_data.entries())),
		}).then((res) => res.json())) as {
			city?: string;
			country?: string;
			firstname?: string;
			gender?: string;
			lastname?: string;
		};

		current_session.city = data.city;
		current_session.country = data.country;
		current_session.firstname = data.firstname;
		current_session.gender = data.gender;
		current_session.lastname = data.lastname;

		this.data.set_session(current_session);
	}

	public session(user?: UserSession): UserStoreData["_session"] {
		if (user) {
			this.data.set_session(user);
		}
		return this.data.get_session();
	}
}
