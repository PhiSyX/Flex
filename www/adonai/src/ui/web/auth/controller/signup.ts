// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { HttpContext } from "@adonisjs/core/http";

import { inject } from "@adonisjs/core";
import vine from "@vinejs/vine";

// biome-ignore lint/style/useImportType: utilisé via le décorateur @inject
import { AuthSignupAction } from "@phisyx/adonai-domain/auth/action/signup";
import { AuthRouteWebID } from "@phisyx/adonai-domain/auth/http";
import { UserRepository } from "@phisyx/adonai-domain/auth/contract/user_repository";
import {
	PASSWORD_LENGTH_MAX,
	PASSWORD_LENGTH_MIN,
} from "@phisyx/adonai-domain/auth/specs/owasp";

export default class AuthSignupWebController {
	public async view(ctx: HttpContext) {
		return ctx.inertia.render("auth/signup", {
			links: {
				login: { href: AuthRouteWebID.Login },
			},
		});
	}

	static validator = vine.compile(
		vine.object({
			username: vine
				.string()
				.alphaNumeric()
				.minLength(3)
				.maxLength(30)
				.unique(async (_lucid, username, _fields_ctx, container) => {
					let user_repository = await container.make(UserRepository);
					return !(await user_repository.is_name_exists(username));
				}),
			email: vine
				.string()
				.email()
				.unique(async (_lucid, email, _fields_ctx, container) => {
					let user_repository = await container.make(UserRepository);
					return !(await user_repository.is_email_exists(email));
				}),
			password: vine
				.string()
				.minLength(PASSWORD_LENGTH_MIN)
				.maxLength(PASSWORD_LENGTH_MAX),
			password_confirmation: vine
				.string()
				.confirmed({ confirmationField: "password" }),
		}),
	);

	@inject()
	public async handle(
		ctx: HttpContext,
		auth_signup_action: AuthSignupAction,
	) {
		let signup_form = await ctx.request.validateUsing(
			AuthSignupWebController.validator,
		);
		await auth_signup_action.register(signup_form);
		return ctx.response.redirect(AuthRouteWebID.Login);
	}
}
