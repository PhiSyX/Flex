// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Err, None, Ok, type Result } from "@phisyx/flex-safety";
import type { ChatStore } from "~/store/ChatStore";

import type { AuthApiHTTPClient } from "./feign/api";
import { AuthSubCommand } from "./subcommand";

// -------------- //
// Implémentation //
// -------------- //

export class AuthCommand {
	static from_str(value: string): Result<AuthSubCommand, Error> {
		switch (value) {
			case "id":
			case "ident":
			case "identify":
				return Ok(AuthSubCommand.IDENTIFY);

			case "reg":
			case "register":
				return Ok(AuthSubCommand.REGISTER);

			default: {
				let err = new Error(
					`La commande "${value}" n'est pas valide pour le module AUTH`,
				);
				return Err(err);
			}
		}
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private store: ChatStore,
		private authApiHttpClient: AuthApiHTTPClient,
	) {}

	sendIdentify(payload: AuthIdentifyFormData) {
		payload.remember_me ??= false;

		const onSuccess = (response: AuthIdentifyHttpResponse) => {
			this.store.emit("AUTH IDENTIFY", response);

			const message = "-AuthServ:IDENTIFY- Connexion réussie";
			const connectData = {
				origin: this.store.client(),
				tags: { msgid: response.id },
			};
			this.store
				.roomManager()
				.active()
				.addConnectEvent(connectData, message);
		};

		const onFailure = async (problem: HttpProblemErrorResponse) => {
			const detail = problem.detail;
			const message = `-AuthServ:IDENTIFY- ${detail}`;
			const connectData = {
				origin: this.store.client(),
				tags: { msgid: new Date().toISOString() },
			};
			this.store
				.roomManager()
				.active()
				.addErrorEvent(connectData, message);
		};

		this.authApiHttpClient
			.identify(payload)
			.then(onSuccess)
			.catch(onFailure);
	}

	sendRegister(payload: AuthRegisterFormData) {
		const onSuccess = (response: AuthRegisterHttpResponse) => {
			const connectData = {
				origin: this.store.client(),
				tags: { msgid: response.id },
			};
			const message = `-AuthServ:REGISTER- ${response.message}`;

			this.store
				.roomManager()
				.active()
				.addConnectEvent(connectData, message);
		};

		const onFailure = (problem: HttpProblemErrorResponse) => {
			this.store.overlayer.create({
				id: "authserv-register-error",
				centered: true,
				onClose: () => {
					this.store.clientError = None();
				},
			});

			function filterObject<T extends object>(
				obj: T,
				keys: Array<string>,
			): Partial<T> {
				let filtered = Object.entries(obj).filter(([key, _]) =>
					keys.includes(key),
				);
				return Object.fromEntries(filtered) as Partial<T>;
			}

			const filteredPayload = filterObject(
				payload,
				(problem.errors || []).flatMap((err) =>
					err.pointer.slice(2).split("/"),
				),
			);

			this.store.clientError.replace({
				id: "authserv-register-error",
				title: "L'inscription est impossible",
				subtitle: problem.title,
				problems: problem.errors || [],
				detail: problem.detail,
				data: filteredPayload,
			});

			const connectData = {
				origin: this.store.client(),
				tags: { msgid: new Date().toISOString() },
			};
			const message = `-AuthServ:REGISTER- ${problem.title}`;

			this.store
				.roomManager()
				.active()
				.addErrorEvent(connectData, message);
		};

		this.authApiHttpClient
			.register(payload)
			.then(onSuccess)
			.catch(onFailure);
	}
}
