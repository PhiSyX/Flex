// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { UserRepository } from "#auth/contract/user_repository";
import type { Users } from "#types/database";
import type { User } from "#auth/user";

import { Result } from "@phisyx/flex-safety";

import {
	UserRepositoryError,
	UserRepositoryException,
} from "#auth/error/user_repository";

export class FakeUserRepository implements UserRepository {
	private users: Map<Users["id"], Users> = new Map();

	async find_by_identifier(
		identifier: string,
	): Promise<Result<Users, UserRepositoryException>> {
		return Result.from(
			Array.from(this.users.values()).find((user) => {
				return (
					user.name === identifier || user.email === identifier
				);
			}),
			new UserRepositoryException(UserRepositoryError.NoIdentifierFound),
		).as<Users, UserRepositoryException>();
	}

	async insert(user: User): Promise<boolean> {
		this.users.set(user.id, user as unknown as Users);
		return true;
	}
}
