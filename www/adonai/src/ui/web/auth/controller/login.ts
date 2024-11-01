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
// biome-ignore lint/style/useImportType: utilisé via le décorateur @inject
import { AuthLoginAction } from "@phisyx/adonai-domain/auth/action/login.js";
import { AuthLoginFailedError } from "@phisyx/adonai-domain/auth/error/login_failed.js";

import hash from "@adonisjs/core/services/hash";
import vine from "@vinejs/vine";

export default class AuthLoginWebController {
	public async view(ctx: HttpContext) {
		return ctx.inertia.render("auth/Login");
	}

	// TODO: à séparer
	static validator = vine.compile(
		vine.object({
			identifier: vine.string().minLength(3).maxLength(30),
			password: vine.string().minLength(8).maxLength(64),
			remember_me: vine.boolean().optional(),
		}),
	);

	@inject()
	public async handle(ctx: HttpContext, auth_login_action: AuthLoginAction) {
		let login_form = await ctx.request.validateUsing(
			AuthLoginWebController.validator,
		);
		let maybe_user = await auth_login_action.connect(login_form);

		if (maybe_user.is_err()) {
			let err = maybe_user.unwrap_err();

			switch (err.kind) {
				case AuthLoginFailedError.InvalidIdentifier:
					{
						await hash.use("argon2").make("0123456789");

						ctx.session.flash("errors", {
							global: "Authentification échouée.",
						});
					}
					break;

				case AuthLoginFailedError.InvalidCredentials:
					{
						ctx.session.flash("errors", { global: err.message });
					}
					break;
			}

			if (ctx.request.header("x-inertia")) {
				return ctx.inertia.location(ctx.request.url());
			}

			return ctx.response.redirect().back();
		}

		let user = maybe_user.unwrap();

		await ctx.auth.use("web").login(user, login_form.remember_me);

		if (ctx.request.header("x-inertia")) {
			return ctx.inertia.location("/chat");
		}

		return ctx.response.redirect("/chat");
	}
}
