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

import { AuthLogoutDTO } from "@phisyx/adonai-domain/auth/dto/logout.js";
import { AuthRouteWebID } from "@phisyx/adonai-domain/auth/http.js";

export default class AuthLogoutWebController {
	public async view(ctx: HttpContext) {
		// NOTE(phisyx): cette route est protégée par le middleware
		// d'authentification, par conséquent, l'utilisateur est forcément en
		// session dans ce context.
		// biome-ignore lint/style/noNonNullAssertion: lire la note ci-haut.
		let user = AuthLogoutDTO.from(ctx.auth.user!);
		return ctx.inertia.render("auth/Logout", { user });
	}

	public async handle(ctx: HttpContext) {
		await ctx.auth.use("web").logout();

		if (ctx.request.header("x-inertia")) {
			return ctx.inertia.location(AuthRouteWebID.Logout);
		}

		return ctx.response.redirect(AuthRouteWebID.Logout);
	}
}
