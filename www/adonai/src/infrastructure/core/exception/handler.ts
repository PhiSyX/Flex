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

import { errors as vine_errors } from "@vinejs/vine";
import { SUPPORT_MAIL } from "#config/mail";

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
		if (
			ctx.request.url().indexOf("/auth") >= 0 &&
			error instanceof vine_errors.E_VALIDATION_ERROR
		) {
			this.handle_auth_validation_error(error);
		}

		return super.handle(error, ctx);
	}

	// NOTE: ne pas leak que le champ existe en base de données.
	handle_auth_validation_error(error: { messages: Array<{ rule: string }> }) {
		const VIOLATION_ERR =
			// biome-ignore lint/style/useTemplate: non.
			"Suite à une violation de nos conditions générales" +
			" d'utilisation, ce pseudo/email a été bloquée de manière" +
			" temporaire ou définitive. Si vous pensez qu'il s'agit" +
			" d'une erreur, veuillez contacter notre support pour" +
			" une assistance: " +
			SUPPORT_MAIL;

		error.messages = error.messages.map((msg) => {
			if (["database.unique", "database.exists"].includes(msg.rule)) {
				return {
					message: VIOLATION_ERR,
					rule: "tos.violation",
					field: "global",
				};
			}
			return msg;
		});
	}

	async report(error: unknown, ctx: HttpContext) {
		return super.report(error, ctx);
	}
}
