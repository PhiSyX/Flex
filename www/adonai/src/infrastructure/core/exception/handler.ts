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
import type {
	StatusPageRange,
	StatusPageRenderer,
} from "@adonisjs/core/types/http";

import { ExceptionHandler } from "@adonisjs/core/http";

import app from "@adonisjs/core/services/app";

export default class HttpExceptionHandler extends ExceptionHandler {
	protected debug = !app.inProduction;

	protected renderStatusPages = app.inProduction;

	protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
		"404": (error, { inertia }) =>
			inertia.render("errors/not_found", { error }),
		"500..599": (error, { inertia }) =>
			inertia.render("errors/server", { error }),
	};

	async handle(error: unknown, ctx: HttpContext) {
		// console.error(error);
		return super.handle(error, ctx);
	}

	async report(error: unknown, ctx: HttpContext) {
		return super.report(error, ctx);
	}
}
