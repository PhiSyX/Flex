// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { UserRepository } from "@phisyx/adonai-domain/auth/contract/user_repository.js";
import type { DB, Users } from "@phisyx/adonai-domain/types/database.js";
import type { User } from "@phisyx/adonai-domain/auth/user.js";

import { inject } from "@adonisjs/core";
import {
	UserRepositoryError,
	UserRepositoryException,
} from "@phisyx/adonai-domain/auth/error/user_repository.js";
import { Result } from "@phisyx/flex-safety";
// biome-ignore lint/style/useImportType: Utilisé par le décorateur @inject
import { Kysely } from "kysely";

@inject()
export class PgUserRepository implements UserRepository {
	constructor(private database: Kysely<DB>) {}

	async find_by_identifier(
		identifier: string,
	): Promise<Result<Users, UserRepositoryException>> {
		return Result.from(
			await this.database
				.selectFrom("users")
				.selectAll()
				.where((eb) =>
					eb.or([
						eb("name", "=", identifier),
						eb("email", "=", identifier),
					]),
				)
				.executeTakeFirst(),
			new UserRepositoryException(UserRepositoryError.NoIdentifierFound),
		).as<Users, UserRepositoryException>();
	}

	async insert(user: User): Promise<boolean> {
		await this.database.insertInto("users").values(user).execute();
		return true;
	}
}
