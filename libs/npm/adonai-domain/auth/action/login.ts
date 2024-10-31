// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { PasswordChecker } from "#auth/contract/password_checker";
import type { UserRepository } from "#auth/contract/user_repository";
import type { AuthLoginDTO } from "#auth/dto/login";
import type { Users } from "#types/database";
import type { Result } from "@phisyx/flex-safety";

import { InvalidCredentials } from "#auth/error/invalid_identifier";
import {
	AuthLoginFailedError,
	AuthLoginFailedException,
} from "#auth/error/login_failed";

import { Err, Ok } from "@phisyx/flex-safety";

export class AuthLoginAction {
	constructor(
		private user_repository: UserRepository,
		private password_checker: PasswordChecker,
	) {}

	public async connect(
		login_dto: AuthLoginDTO,
	): Promise<Result<Users, AuthLoginFailedException>> {
		let maybe_user = await this.user_repository.find_by_identifier(
			login_dto.identifier,
		);

		if (maybe_user.is_err()) {
			return Err(
				new AuthLoginFailedException(
					AuthLoginFailedError.InvalidIdentifier,
					maybe_user.unwrap_err(),
				),
			);
		}

		let user = maybe_user.unwrap();

		let is_valid = await this.password_checker.verify(
			user.password,
			login_dto.password,
		);

		if (!is_valid) {
			return Err(
				new AuthLoginFailedException(
					AuthLoginFailedError.InvalidCredentials,
					new InvalidCredentials(),
				),
			);
		}

		return Ok(user).as<Users, AuthLoginFailedException>();
	}
}
