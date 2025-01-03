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
import logger from "@adonisjs/core/services/logger";
import vine from "@vinejs/vine";

import { AccountRouteWebID } from "@phisyx/adonai-domain/account/http";
// biome-ignore lint/style/useImportType: utilisé via le décorateur @inject
import { AuthLoginAction } from "@phisyx/adonai-domain/auth/action/login";
import { AuthLoginFailedError } from "@phisyx/adonai-domain/auth/error/login_failed";
import { AuthRouteWebID } from "@phisyx/adonai-domain/auth/http";
import {
	PASSWORD_LENGTH_MAX,
	PASSWORD_LENGTH_MIN,
} from "@phisyx/adonai-domain/auth/specs/owasp";
// biome-ignore lint/style/useImportType: utilisé via le décorateur @inject
import { PasswordHasher } from "@phisyx/adonai-domain/auth/contract/password_hasher";

export default class AuthLoginWebController {
	public async view(ctx: HttpContext) {
		return ctx.inertia.render("auth/login", {
			links: {
				register: { href: AuthRouteWebID.Signup },
			},
		});
	}

	// TODO: à séparer
	static validator = vine.compile(
		vine.object({
			identifier: vine.string().alphaNumeric().minLength(3).maxLength(30),
			password: vine
				.string()
				.minLength(PASSWORD_LENGTH_MIN)
				.maxLength(PASSWORD_LENGTH_MAX),
			remember_me: vine.boolean().optional(),
		}),
	);

	@inject()
	public async handle(
		ctx: HttpContext,
		auth_login_action: AuthLoginAction,
		password_hasher: PasswordHasher,
	) {
		let login_form = await ctx.request.validateUsing(
			AuthLoginWebController.validator,
		);
		let maybe_user = await auth_login_action.connect(login_form);

		if (maybe_user.is_err()) {
			let err = maybe_user.unwrap_err();

			logger.use("app").warn(login_form, err.message);

			switch (err.kind) {
				// NOTE(lint): C'est voulu qu'il n'y ait pas de `break` après
				// cette clause switch.
				//
				// biome-ignore lint/suspicious/noFallthroughSwitchClause: ^^^^
				case AuthLoginFailedError.InvalidIdentifier: {
					// NOTE(security): Il s'agit d'une mesure de sécurité visant
					// à prévenir les attaques temporelles.
					await password_hasher.hash("0123456789");
				}

				case AuthLoginFailedError.InvalidCredentials:
					{
						ctx.session.flash("errors", {
							global: "Authentification échouée.",
						});
					}
					break;
			}

			return ctx.response.redirect().back();
		}

		let user = maybe_user.unwrap();

		await ctx.auth.use("web").login(user, login_form.remember_me);

		let redirect_url: string = ctx.request.input(
			"r",
			AccountRouteWebID.Self,
		);

		if (
			ctx.request.header("x-inertia") &&
			redirect_url.indexOf("http") >= 0
		) {
			return ctx.inertia.location(redirect_url);
		}

		return ctx.response.redirect(redirect_url);
	}
}
