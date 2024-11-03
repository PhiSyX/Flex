// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { User } from "#auth/user";
import { IdGenerator } from "#shared/id_generator";

import type { Users } from "#types/database";

let id_generator = new IdGenerator();

export const users: Array<User> = [
	User.from_database({
		account_status: "private" as unknown as Users["account_status"],
		avatar: null,
		avatar_display_for: "public" as unknown as Users["avatar_display_for"],
		birthday: new Date() as unknown as Users["birthday"],
		city: null,
		country: null,
		created_at: new Date() as unknown as Users["created_at"],
		email: "hello@world.org",
		firstname: null,
		gender: null,
		id: id_generator.generate(),
		lastname: null,
		name: "hello",
		password: "abcdefghijklmnopqrstuvwxyz",
		role: "user" as unknown as Users["role"],
		updated_at: new Date() as unknown as Users["updated_at"],
	}),
	User.from_database({
		account_status: "private" as unknown as Users["account_status"],
		avatar: null,
		avatar_display_for: "public" as unknown as Users["avatar_display_for"],
		birthday: new Date() as unknown as Users["birthday"],
		city: null,
		country: null,
		created_at: new Date() as unknown as Users["created_at"],
		email: "word@hello.org",
		firstname: null,
		gender: null,
		id: id_generator.generate(),
		lastname: null,
		name: "word",
		password: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		role: "user" as unknown as Users["role"],
		updated_at: new Date() as unknown as Users["updated_at"],
	}),
];
