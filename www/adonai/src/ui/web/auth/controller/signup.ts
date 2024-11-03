// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { DB } from "@phisyx/adonai-domain/types/database.js";
import type { HttpContext } from "@adonisjs/core/http";

import { inject } from "@adonisjs/core";
import vine from "@vinejs/vine";

// biome-ignore lint/style/useImportType: utilisé via le décorateur @inject
import { AuthSignupAction } from "@phisyx/adonai-domain/auth/action/signup.js";
import { AuthRouteWebID } from "@phisyx/adonai-domain/auth/http.js";
import { Kysely } from "kysely";

export default class AuthSignupWebController {
	public async view(ctx: HttpContext) {
		return ctx.inertia.render("auth/signup", {
			links: {
				login: { href: AuthRouteWebID.Login },
			},
		});
	}

	// TODO: à améliorer, à séparer
	static validator = vine.compile(
		vine.object({
			username: vine
				.string()
				.minLength(3)
				.maxLength(30)
				.unique(async (_lucid, username, __fields, container) => {
					let db = await container.make(Kysely<DB>);
					let rec = await db
						.selectFrom("users")
						.select("name")
						.where("name", "=", username)
						.executeTakeFirst();
					return rec?.name !== username;
				}),
			email: vine
				.string()
				.email()
				.unique(async (_lucid, email, __fields, container) => {
					let db = await container.make(Kysely<DB>);
					let rec = await db
						.selectFrom("users")
						.select("email")
						.where("email", "=", email)
						.executeTakeFirst();
					return rec?.email !== email;
				}),
			password: vine.string().minLength(8).maxLength(64),
			password_confirmation: vine
				.string()
				.confirmed({ confirmationField: "password" }),
			remember_me: vine.boolean().optional(),
		}),
	);

	@inject()
	public async handle(ctx: HttpContext, auth_signup_action: AuthSignupAction) {
		let signup_form = await ctx.request.validateUsing(
			AuthSignupWebController.validator,
		);

		let is_registered = await auth_signup_action.register(signup_form);
		return ctx.response.redirect(AuthRouteWebID.Login);

		/*
		if (maybe_user.is_err()) {
			let err = maybe_user.unwrap_err();

			logger.use("app").warn(signup_form, err.message);

			switch (err.kind) {
				// NOTE: C'est voulu qu'il n'y ait pas de `break` après cette
				//       clause switch.
				// biome-ignore lint/suspicious/noFallthroughSwitchClause: ^^^^
				case AuthLoginFailedError.InvalidIdentifier: {
					await hash.use("argon2").make("0123456789");
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

		await ctx.auth.use("web").login(user, signup_form.remember_me);

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
		*/
	}
}
