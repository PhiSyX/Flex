// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import router from "@adonisjs/core/services/router";

import { middleware } from "#start/kernel";
import { AuthRouteWebID } from "@phisyx/adonai-domain/auth/http.js";
import AuthSignupWebController from "#ui/web/auth/controller/signup";

const AuthLoginWebController = () => import("#ui/web/auth/controller/login");
const AuthLogoutWebController = () => import("#ui/web/auth/controller/logout");

/** Api Router */

/** Web Router */

router
	.group(() => {
		router
			.get(AuthRouteWebID.Login, [AuthLoginWebController, "view"])
			.as("web.auth.login");
		router.post(AuthRouteWebID.Login, [AuthLoginWebController]);

		router
			.get(AuthRouteWebID.Signup, [AuthSignupWebController, "view"])
			.as("web.auth.signup");
		router.post(AuthRouteWebID.Signup, [AuthSignupWebController]);
	})
	.middleware(middleware.guest());

router
	.group(() => {
		router
			.get(AuthRouteWebID.Logout, [AuthLogoutWebController, "view"])
			.as("web.auth.logout");
		router.delete(AuthRouteWebID.Logout, [AuthLogoutWebController]);
	})
	.use(middleware.auth());
