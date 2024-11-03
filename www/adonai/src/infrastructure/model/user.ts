// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { DateTime } from "luxon";
import type { UsersAccountStatus, UsersAvatarDisplayFor, UsersRole } from "@phisyx/adonai-domain/types/database";

import { withAuthFinder } from "@adonisjs/auth/mixins/lucid";
import { compose } from "@adonisjs/core/helpers";
import { BaseModel, column } from "@adonisjs/lucid/orm";

import hash from "@adonisjs/core/services/hash";

const AuthFinder = withAuthFinder(() => hash.use("argon2"), {
	uids: ["name", "email"],
	passwordColumnName: "password",
});

export default class User extends compose(BaseModel, AuthFinder) {
	@column({ isPrimary: true })
	declare id: number;

	@column()
	declare name: string;

	@column()
	declare email: string;

	@column({ serializeAs: null })
	declare password: string;

	@column()
	declare role: UsersRole | null;

	@column()
	declare avatar: string | null;

	@column()
	declare avatar_display_for: UsersAvatarDisplayFor | null;

	@column()
	declare firstname: string | null;

	@column()
	declare lastname: string | null;

	@column()
	declare gender: string | null;

	@column.date()
	declare birthday: DateTime | null;

	@column()
	declare country: string | null;

	@column()
	declare city: string | null;

	@column()
	declare account_status: UsersAccountStatus | null;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime | null;
}
