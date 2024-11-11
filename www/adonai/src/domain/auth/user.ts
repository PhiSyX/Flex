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
	Users,
	UsersAccountStatus,
	UsersAvatarDisplayFor,
	UsersRole,
} from "#types/database";
import type { AuthSignupInputDTO } from "./dto/signup";

import { IdGenerator } from "#shared/id_generator";

export class User {
	public static from_signup_dto(dto: AuthSignupInputDTO): User {
		return new User(
			new IdGenerator().generate(),
			dto.username,
			dto.email,
			dto.password,
		).with_creation_date();
	}

	public static from_database(user: Users): User {
		return new User(
			user.id,
			user.name,
			user.email,
			user.password,
			user.created_at as unknown as Date | null,
			user.updated_at as unknown as Date | null,
			user.account_status as unknown as UsersAccountStatus,
			user.avatar_display_for as unknown as UsersAvatarDisplayFor,
			user.role as unknown as UsersRole,
			user.avatar,
			user.birthday as unknown as Date | null,
			user.city,
			user.country,
			user.firstname,
			user.gender,
			user.lastname,
		);
	}

	constructor(
		public id: string,
		public name: string,
		public email: string,
		public password: string,
		private created_at: Date | "NOW()" | null = null,
		private updated_at: Date | "NOW()" | null = null,
		public account_status: UsersAccountStatus = "secret",
		public avatar_display_for: UsersAvatarDisplayFor = "member_only",
		public role: UsersRole = "user",
		public avatar: string | null = null,
		public birthday: Date | null = null,
		public city: string | null = null,
		public country: string | null = null,
		public firstname: string | null = null,
		public gender: string | null = null,
		public lastname: string | null = null,
	) {}

	with_creation_date(): this {
		this.created_at = "NOW()";
		this.updated_at = "NOW()";
		return this;
	}

	with_updated(): this {
		this.updated_at = "NOW()";
		return this;
	}

	get_created_at(): Date | null {
		if (this.created_at === "NOW()") {
			return null;
		}
		return this.created_at;
	}

	get_updated_at(): Date | null {
		if (this.updated_at === "NOW()") {
			return null;
		}
		return this.updated_at;
	}
}
