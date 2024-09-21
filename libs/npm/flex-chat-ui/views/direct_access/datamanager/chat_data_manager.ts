// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	CommandInterface,
	Module,
} from "@phisyx/flex-chat/modules/interface";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store";
import type { Option } from "@phisyx/flex-safety";
import type { DirectAccessFormData } from "../formdata";
import type { DirectAccessInteractor } from "../interactor";

import { HandlerManager } from "@phisyx/flex-chat/handlers/manager";
import { None } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessChatManager {
	constructor(
		private store: ChatStoreInterface & ChatStoreInterfaceExt,
		handlers: {
			[key: string]: Record<string, () => Promise<unknown>>;
		},
	) {
		for (let [_, handler_map] of Object.entries(handlers)) {
			this.handler_manager = this.handler_manager.extends(handler_map);
		}
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<DirectAccessInteractor> = None();

	private handler_manager = new HandlerManager();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): DirectAccessInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: DirectAccessInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	connect(
		form_data: DirectAccessFormData,
		when_replies: {
			welcome: () => void;
			nicknameinuse: (
				error: GenericErrorReply<"ERR_NICKNAMEINUSE">,
			) => void;
		},
	) {
		this.store.set_connect_user_info(form_data);
		this.store.connect_websocket(form_data.websocket_server_url);

		// @ts-expect-error : à corriger
		if (import.meta.env.DEV) {
			this.store.websocket().onAnyOutgoing((event_name, ...payload) => {
				console.groupCollapsed("> Event %s", event_name);
				console.debug("Données envoyées:");
				console.table(payload);
				console.groupEnd();
			});

			this.store.websocket().onAny((event_name, ...payload) => {
				console.groupCollapsed("< Event %s", event_name);
				console.debug("Données reçues:");
				console.table(payload);
				console.groupEnd();
			});
		}

		this.store.websocket().once("connect", () => {
			for (let [_, handler] of this.handler_manager.handlers()) {
				handler.listen();
			}

			for (let [_, module] of this.store.module_manager().modules()) {
				module.listen();
			}

			if (form_data.password_server) {
				this.store.emit("PASS", {
					password: form_data.password_server,
				});
			}

			this.store.emit("NICK (unregistered)", {
				nickname: form_data.nickname,
			});

			this.store.emit("USER", {
				user: form_data.nickname,
				mode: 1 << 3,
				realname: form_data.realname,
			});

			this.store.websocket().once("disconnect", (reason) => {
				setTimeout(() => this.store.disconnect_error(reason), 1_500);
			});
		});

		this.store.listen("RPL_WELCOME", () => when_replies.welcome(), {
			once: true,
		});

		this.store.listen("ERR_NICKNAMEINUSE", (data) =>
			when_replies.nicknameinuse(data),
		);
	}

	async load_all_modules() {
		let total_loaded =
			this.handler_manager.size + this.store.module_manager().size;
		let loaded = 0;

		this.interactor.create_module_layer({
			loaded,
			total_loaded,
		});

		total_loaded = this.handler_manager.size;

		for (let handler of this.handler_manager.sets()) {
			let handler_constructors = (await handler()) as Record<
				string,
				{ new (store: ChatStoreInterface): SocketEventHandler }
			>;

			let handlers = Object.entries(handler_constructors);
			let handlers_size = handlers.length;
			if (handlers_size > 1) {
				total_loaded += handlers_size - 1;
			}

			for (let [handler_name, handler_constructor] of handlers) {
				this.handler_manager.set(
					handler_name,
					new handler_constructor(this.store),
				);

				loaded += 1;

				this.interactor.update_data_module_layer({
					loaded,
					total_loaded: total_loaded,
					module_name: handler_name,
				});
			}
		}

		total_loaded += this.store.module_manager().size;
		for (let module of this.store.module_manager().sets()) {
			let module_constructors = (await module()) as Record<
				string,
				{
					new (): Module & CommandInterface;
					create(
						store: ChatStoreInterface,
					): Module & CommandInterface;
					NAME: string;
				}
			>;

			let modules = Object.entries(module_constructors);
			let modules_size = modules.length;
			if (modules_size > 1) {
				total_loaded += modules_size - 1;
			}

			for (let [module_name, module_constructor] of modules) {
				// @ts-expect-error - Vite env
				if (import.meta.env.DEV) {
					console.info(
						"Le module « %s » est maintenant en écoute.",
						module_name,
					);
				}
				this.store
					.module_manager()
					.set(
						module_constructor.NAME.toUpperCase(),
						module_constructor.create(this.store),
					);

				loaded += 1;

				this.interactor.update_data_module_layer({
					loaded,
					total_loaded,
					module_name,
				});
			}
		}

		this.handler_manager.free();
		this.store.module_manager().free();
		this.interactor.destroy_module_layer();
	}

	send_active_room(message: string) {
		this.store.send_message(
			this.store.room_manager().active().id(),
			message,
		);
	}
}
