// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	Timestamp,
	Users,
	UsersAccountStatus,
	UsersAvatarDisplayFor,
	UsersRole,
} from "#types/database";

/**
 * Crée pour éviter de renvoyer les données sensibles telles que le mots de
 * passes dans la Vue.
 */
export class AccountSelfOutputDTO {
	static from(user: Users): AccountSelfOutputDTO {
		return new AccountSelfOutputDTO(
			user.account_status as unknown as UsersAccountStatus,
			user.avatar,
			user.avatar_display_for as unknown as UsersAvatarDisplayFor,
			user.birthday,
			user.city,
			user.country,
			user.created_at as unknown as Timestamp,
			user.email,
			user.firstname,
			user.gender,
			user.id,
			user.lastname,
			user.name,
			user.role as unknown as UsersRole,
			user.updated_at as unknown as Timestamp,
		);
	}

	constructor(
		public account_status: UsersAccountStatus,
		public avatar: string | null,
		public avatar_display_for: UsersAvatarDisplayFor,
		public birthday: Timestamp | null,
		public city: string | null,
		public country: string | null,
		public created_at: Timestamp,
		public email: string,
		public firstname: string | null,
		public gender: string | null,
		public id: string,
		public lastname: string | null,
		public name: string,
		public role: UsersRole,
		public updated_at: Timestamp,
	) {}
}
