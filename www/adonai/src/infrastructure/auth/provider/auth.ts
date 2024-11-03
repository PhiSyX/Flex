// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ApplicationService } from "@adonisjs/core/types";

import { AuthLoginAction } from "@phisyx/adonai-domain/auth/action/login";
import { AuthSignupAction } from "@phisyx/adonai-domain/auth/action/signup";
import { PasswordChecker } from "@phisyx/adonai-domain/auth/contract/password_checker";
import { PasswordHasher } from "@phisyx/adonai-domain/auth/contract/password_hasher";
import { UserRepository } from "@phisyx/adonai-domain/auth/contract/user_repository";
import { AdonisPasswordChecker } from "../password_checker.js";
import { AdonisPasswordHasher } from "../password_hasher.js";
import { PgUserRepository } from "../repository/pg_user_repository.js";

export default class AuthManagementProvider {
	static maps = [
		[UserRepository, PgUserRepository],
		[PasswordChecker, AdonisPasswordChecker],
		[PasswordHasher, AdonisPasswordHasher],
	];

	constructor(protected app: ApplicationService) {}

	register() {
		for (let [contract, concrete] of AuthManagementProvider.maps) {
			this.app.container.bind(contract, () =>
				this.app.container.make(concrete),
			);
		}

		this.app.container.bind(AuthLoginAction, async (resolver) => {
			let user_repository = await resolver.make(UserRepository);
			let password_checker = await resolver.make(PasswordChecker);

			return new AuthLoginAction(user_repository, password_checker);
		});

		this.app.container.bind(AuthSignupAction, async (resolver) => {
			let user_repository = await resolver.make(UserRepository);
			let password_hasher = await resolver.make(PasswordHasher);

			return new AuthSignupAction(user_repository, password_hasher);
		});
	}

	async boot() {}

	async start() {}

	async ready() {}

	async shutdown() {}
}
