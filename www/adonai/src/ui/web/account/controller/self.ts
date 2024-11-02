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

import { AccountSelfOutputDTO } from "@phisyx/adonai-domain/account/dto/self.js";
import { AuthRouteWebID } from "@phisyx/adonai-domain/auth/http.js";

export default class AccountSelfWebController {
	public async view(ctx: HttpContext) {
		// NOTE(phisyx): cette route est protégée par le middleware
		// d'authentification, par conséquent, l'utilisateur est forcément en
		// session dans ce context.
		// biome-ignore lint/style/noNonNullAssertion: lire la note ci-haut.
		let user = AccountSelfOutputDTO.from(ctx.auth.user!);
		return ctx.inertia.render("account/self", {
			user,
			links: {
				logout: {
					href: AuthRouteWebID.Logout,
					type: "delete" as const,
				},
			},
		});
	}
}
