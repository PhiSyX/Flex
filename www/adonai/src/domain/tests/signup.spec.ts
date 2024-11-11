// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { it } from "vitest";

import { FakeUserRepository } from "./adapter/fake_user_repository";
import { users } from "./factory/user";
import { AuthSignupAction } from "#auth/action/signup";
import { FakePasswordHasher } from "./adapter/fake_password_hasher";

let repo = new FakeUserRepository();

it("should register with the good data", async ({ expect }) => {
	let factory_user = users[0];

	let password_hasher = new FakePasswordHasher(
		// biome-ignore lint/style/useTemplate: ;-)
		"secret" + factory_user.password,
	);
	let auth_signup_action = new AuthSignupAction(repo, password_hasher);

	let is_reg = await auth_signup_action.register({
		username: factory_user.name,
		email: factory_user.email,
		password: factory_user.password,
	});

	expect(is_reg).toBeTruthy();
	let maybe_user = await repo.find_by_identifier(factory_user.name);
	expect(maybe_user.is_ok()).toBeTruthy();
	let user = maybe_user.unwrap();
	expect(user.name).toBe(factory_user.name);
	expect(user.email).toBe(factory_user.email);
	// biome-ignore lint/style/useTemplate: ;-)
	expect(user.password).toBe("secret" + factory_user.password);
});
