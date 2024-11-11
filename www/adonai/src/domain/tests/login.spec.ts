// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { beforeAll, it } from "vitest";

import { AuthLoginAction } from "#auth/action/login";
import { InvalidCredentials } from "#auth/error/invalid_identifier";
import { FakePasswordChecker } from "./adapter/fake_password_checker";
import { FakeUserRepository } from "./adapter/fake_user_repository";
import { users } from "./factory/user";
import { AuthLoginFailedException } from "#auth/error/login_failed";

let repo = new FakeUserRepository();

beforeAll(async () => {
	for (let user of users) {
		repo.insert(user);
	}
});

it("should connect with the good username", async ({ expect }) => {
	let factory_user = users[0];

	let good_password_verifier = new FakePasswordChecker(true);
	let auth_login_action = new AuthLoginAction(repo, good_password_verifier);

	let user = await auth_login_action.connect({
		identifier: factory_user.name,
		password: factory_user.password,
	});

	expect(user.is_ok()).to.be.true;
	expect(user.unwrap()).to.eq(factory_user);
});

it("should connect with the good email", async ({ expect }) => {
	let factory_user = users[0];

	let good_password_verifier = new FakePasswordChecker(true);
	let auth_login_action = new AuthLoginAction(repo, good_password_verifier);

	let user = await auth_login_action.connect({
		identifier: factory_user.email,
		password: factory_user.password,
	});

	expect(user.is_ok()).to.be.true;
	expect(user.unwrap()).to.eq(factory_user);
});

it("should returns InvalidCredentials with bad credentials", async ({ expect }) => {
	let factory_user1 = users[0];
	let factory_user2 = users[1];

	let bad_password_verifier = new FakePasswordChecker(false);
	let auth_login_action = new AuthLoginAction(repo, bad_password_verifier);

	let user = await auth_login_action.connect({
		identifier: factory_user1.name,
		password: factory_user2.password,
	});

	expect(user.is_err()).to.be.true;
	// expect(() => user.unwrap()).to.toThrowError(AuthLoginFailedException);
	let err = user.unwrap_err();
	expect(err).to.toBeInstanceOf(AuthLoginFailedException);
	expect(err.cause).to.toBeInstanceOf(InvalidCredentials);
});
