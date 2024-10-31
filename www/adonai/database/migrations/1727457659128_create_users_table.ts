// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "users";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table
				.uuid("id")
				.defaultTo((fn_helper) => fn_helper.uuid())
				.notNullable();

			table.string("name").notNullable().unique();
			table.string("email").notNullable().unique();
			table.string("password").notNullable();

			table
				.enum(
					"role",
					["user", "moderator", "admin", "sysadmin", "netadmin"],
					{
						useNative: true,
						existingType: true,
						enumName: "users_role",
					},
				)
				.defaultTo("user")
				.notNullable();

			table.string("avatar");

			table
				.enum("avatar_display_for", ["public", "member_only"], {
					useNative: true,
					existingType: true,
					enumName: "users_avatar_display_for",
				})
				.defaultTo("member_only");

			table.string("firstname", 30).nullable();
			table.string("lastname", 30).nullable();
			table.string("gender", 30).nullable();
			table.date("birthday").nullable();
			table.string("country", 50).nullable();
			table.string("city", 100).nullable();

			table
				.enum("account_status", ["public", "private", "secret"], {
					useNative: true,
					existingType: true,
					enumName: "users_account_status",
				})
				.defaultTo("secret");

			table.timestamp("created_at").notNullable();
			table.timestamp("updated_at").nullable();
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
