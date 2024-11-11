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
	SessionGuardUser,
	SessionUserProviderContract,
} from "@adonisjs/auth/types/session";
import type { DB, Users } from "@phisyx/adonai-domain/types/database";
import type { Kysely } from "kysely";

import { symbols } from "@adonisjs/auth";

export class SessionUserProvider implements SessionUserProviderContract<Users> {
	constructor(private db: Kysely<DB>) {}

	declare [symbols.PROVIDER_REAL_USER]: Users;

	async createUserForGuard(user: Users): Promise<SessionGuardUser<Users>> {
		return {
			getId() {
				return user.id;
			},
			getOriginal() {
				return user;
			},
		};
	}

	async findById(id: string): Promise<SessionGuardUser<Users> | null> {
		const user = (await this.db
			.selectFrom("users")
			.selectAll()
			.where("id", "=", id)
			.executeTakeFirst()) as unknown as Users | undefined;

		if (!user) {
			return null;
		}

		return this.createUserForGuard(user);
	}
}
