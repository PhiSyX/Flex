// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Result } from "@phisyx/flex-safety/result";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	ChatStoreUUIDExt,
} from "../../store";
import type { AuthApiHTTPClient } from "./feign/api";

import { None } from "@phisyx/flex-safety/option";
import { Err, Ok } from "@phisyx/flex-safety/result";

import { ClientErrorLayer } from "../../layers/client_error";
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

			default:
				return Err(
					new Error(
						`La commande "${value}" n'est pas valide pour le module AUTH`,
					),
				);
		}
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private store: ChatStoreInterface &
			ChatStoreInterfaceExt &
			ChatStoreUUIDExt,
		private auth_api_http_client: AuthApiHTTPClient,
	) {}

	async send_identify(payload: AuthIdentifyFormData) {
		payload.remember_me ??= false;

		const on_success = (response: AuthIdentifyHttpResponse) => {
			this.store.emit("AUTH IDENTIFY", response);

			let message = "-AuthServ- Connexion réussie";
			let connect_data = {
				origin: this.store.client(),
				tags: { msgid: response.id },
			};

			this.store
				.room_manager()
				.active()
				.add_connect_event(connect_data, message);
		};

		const on_failure = (problem: HttpProblemErrorResponse) => {
			let detail = problem.detail;
			let message = `-AuthServ- ${detail}`;
			let [random_uuid] = this.store.uuid(7).take(1);
			let connect_data = {
				origin: this.store.client(),
				tags: { msgid: random_uuid },
			};

			this.store
				.room_manager()
				.active()
				.add_error_event(connect_data, message);
		};

		try {
			on_success(await this.auth_api_http_client.identify(payload));
		} catch (err) {
			function assert_type(
				_: unknown,
			): asserts _ is HttpProblemErrorResponse {}

			assert_type(err);

			on_failure(err);
		}
	}

	async send_register(payload: AuthRegisterFormData) {
		const on_success = (response: AuthRegisterHttpResponse) => {
			// FIXME: type à corriger
			if (!response.message) {
				return;
			}
			let connect_data = {
				origin: this.store.client(),
				tags: { msgid: response.id },
			};
			let message = `-AuthServ- ${response.message}`;

			this.store
				.room_manager()
				.active()
				.add_connect_event(connect_data, message);
		};

		const on_failure = (problem: HttpProblemErrorResponse) => {
			this.store.overlayer().create({
				id: ClientErrorLayer.ID,
				centered: true,
				on_close: () => {
					this.store.client_error = None();
				},
			});

			function filter_object<T extends object>(
				obj: T,
				keys: Array<string>,
			): Partial<T> {
				let filtered = Object.entries(obj).filter(([key, _]) =>
					keys.includes(key),
				);
				return Object.fromEntries(filtered) as Partial<T>;
			}

			let filtered_payload = filter_object(
				payload,
				(problem.errors || []).flatMap((err) =>
					err.pointer.slice(2).split("/"),
				),
			);

			this.store.client_error.replace({
				id: ClientErrorLayer.ID,
				title: "L'inscription est impossible",
				subtitle: problem.title,
				problems: problem.errors || [],
				detail: problem.detail,
				data: filtered_payload,
			});

			let [random_uuid] = this.store.uuid(7).take(1);
			let connect_data = {
				origin: this.store.client(),
				tags: { msgid: random_uuid },
			};
			let message = `-AuthServ- ${problem.title}`;

			this.store
				.room_manager()
				.active()
				.add_error_event(connect_data, message);
		};

		try {
			on_success(await this.auth_api_http_client.register(payload));
		} catch (err) {
			function assert_type(
				_: unknown,
			): asserts _ is HttpProblemErrorResponse {}
			assert_type(err);

			on_failure(err);
		}
	}

	send_logout(f: boolean) {
		let client_id = this.store.client_id();
		this.store.emit("LOGOUT", {
			client_id,
			// @ts-expect-error : à corriger/changer
			user_session: this.store.user().session().unwrap_or(null),
		});
		if (f) {
			this.store.user().disconnect();
		}
	}
}
