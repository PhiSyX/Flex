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
import server from "@adonisjs/core/services/server";

server.errorHandler(() => import("#infrastructure/core/exception/handler"));

server.use([
	() => import("#infrastructure/core/middleware/container_bindings"),
	() => import("@adonisjs/static/static_middleware"),
	() => import("@adonisjs/cors/cors_middleware"),
	() => import("@adonisjs/vite/vite_middleware"),
	() => import("@adonisjs/inertia/inertia_middleware"),
]);

router.use([
	() => import("@adonisjs/core/bodyparser_middleware"),
	() => import("@adonisjs/session/session_middleware"),
	() => import("@adonisjs/shield/shield_middleware"),
	() => import("@adonisjs/auth/initialize_auth_middleware"),
]);

export const middleware = router.named({
	guest: () => import("#infrastructure/auth/middleware/guest"),
	auth: () => import("#infrastructure/auth/middleware/auth"),
});
