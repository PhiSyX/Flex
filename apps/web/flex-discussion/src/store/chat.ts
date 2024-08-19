// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Router } from "vue-router";

import type {
	ChatStoreInterfaceExt,
	ChatStoreUUIDExt,
	CommandInterface,
	ConnectUserInfo,
	Module,
	OverlayerStore,
	UUIDStore,
	UUIDVariant,
	UserStore,
} from "@phisyx/flex-chat";

import {
	acceptHMRUpdate as accept_hmr_update,
	defineStore as define_store
} from "pinia";
import { io } from "socket.io-client";
import { computed, reactive } from "vue";
import { useRouter as use_router } from "vue-router";

import { is_string } from "@phisyx/flex-asserts";
import { ChatStore, View, is_channel } from "@phisyx/flex-chat";
import { None } from "@phisyx/flex-safety";

import { use_overlayer_store } from "./overlayer";
import { use_settings_store } from "./settings";
import { use_user_store } from "./user";
import { useUUIDv4Store, useUUIDv7Store } from "./uuid";

// -------------- //
// Implémentation //
// -------------- //

export class ChatStoreVue extends ChatStore implements
	ChatStoreInterfaceExt,
	ChatStoreUUIDExt
{
	audio_src: ChatStoreInterfaceExt["audio_src"] = null;

	private _router = use_router();

	private _overlayer = use_overlayer_store() as unknown as OverlayerStore;
	private _user = use_user_store() as unknown as UserStore;
	private _settings = use_settings_store();

	private _uuidv4 = useUUIDv4Store() as unknown as UUIDStore;
	private _uuidv7 = useUUIDv7Store() as unknown as UUIDStore;

	static default(): ChatStoreVue
	{
		let cs = reactive(new ChatStoreVue()) as ChatStoreVue;
		cs.room_manager().set_on_change((room_id) => {
			let servername = cs.network_name();
					
			if (is_channel(room_id)) {
				cs.router().push({
					name: View.Channel, 
					params: {
						servername,
						channelname: room_id,
					},
				});
			} else if (is_string(room_id) && !room_id.startsWith("@")) {
				cs.router().push({
					name: View.Private,
					params: {
						id: room_id,
					},
				});
			} else {
				cs.router().push({
					name: View.Chat,
				});
			}
		});
		return cs;
	}

	// ------- //
	// Méthode // -> ChatStoreInterfaceExt
	// ------- //

	connect(connect_user_info: ConnectUserInfo)
	{
		this.set_connect_user_info(connect_user_info);
		this.connect_websocket(connect_user_info.websocket_server_url);

		if (import.meta.env.DEV) {
			this.websocket().onAnyOutgoing((event_name, ...payload) => {
				console.groupCollapsed("> Event %s", event_name);
				console.debug("Données envoyées:");
				console.table(payload);
				console.groupEnd();
			});

			this.websocket().onAny((event_name, ...payload) => {
				console.groupCollapsed("< Event %s", event_name);
				console.debug("Données reçues:");
				console.table(payload);
				console.groupEnd();
			});
		}

		this.websocket().once("connect", () => {
			for (let [_, handler] of this.handler_manager().handlers()) {
				handler.listen();
			}
			for (let [_, module] of this.module_manager().modules()) {
				module.listen();
			}

			if (connect_user_info.password_server) {
				this.emit("PASS", {
					password: connect_user_info.password_server,
				});
			}

			this.emit("NICK (unregistered)", {
				nickname: connect_user_info.nickname,
			});
			
			this.emit("USER", {
				user: connect_user_info.nickname,
				mode: 1 << 3,
				realname: connect_user_info.realname,
			});

			this.websocket().once("disconnect", (reason) => {
				setTimeout(() => this.disconnect_error(reason), 1_500);
			});
		});
	}

	connect_websocket(websocket_server_url: string)
	{
		console.info(
			"Connexion au serveur de WebSocket « %s »",
			websocket_server_url,
		);

		let client_id = this._client_id_storage.maybe().unwrap_or("") as
			| string
			| null;
		let user_id = this.user().session().map((u) => u.id).unwrap_or("") as string | null;

		if (client_id?.length === 0) {
			client_id = null;
		}

		if (user_id?.length === 0) {
			user_id = null;
		}

		let wsio = <TypeSafeSocket>io(websocket_server_url, {
			auth: { user_id: user_id, client_id: client_id },
			transports: ["websocket"],
			reconnection: true,
			reconnectionDelay: 10_000,
			rememberUpgrade: true,
			secure: true,
			withCredentials: true,
		});

		wsio.io.engine.binaryType = "arraybuffer";

		this._ws.replace(wsio);
	}

	disconnect_error(comment: GenericReply<"ERROR"> | string)
	{
		this._overlayer.create({
			id: "error-layer",
			centered: true,
			on_close: () => {
				this.client_error = None();
				window.location.reload();
			},
		});

		this.client_error.replace({
			id: "error-layer",
			data: comment,
		});
	}

	async load_all_modules()
	{
		let total_loaded = this._handler_manager.size + this._module_manager.size;
		let loaded = 0;

		type LayerData = {
			module_name?: string;
			total_loaded: number;
			loaded: number;
		};

		this._overlayer.create<LayerData>({
			id: "load-all-modules",
			centered: true,
			destroyable: "manual",
			data: { loaded, total_loaded },
		});

		total_loaded = this._handler_manager.size;

		for (let handler of this._handler_manager.sets()) {
			let handler_constructors = (await handler()) as Record<
				string,
				{ new (store: ChatStore): SocketEventHandler }
			>;

			let handlers = Object.entries(handler_constructors);
			let handlers_size = handlers.length;
			if (handlers_size > 1) {
				total_loaded += handlers_size - 1;
			}

			for (let [handler_name, handler_constructor] of handlers) {
				this._handler_manager.set(handler_name, new handler_constructor(this));

				loaded += 1;

				this._overlayer.update_data<LayerData>("load-all-modules", {
					loaded,
					total_loaded: total_loaded,
					module_name: handler_name,
				});
			}
		}

		total_loaded += this._module_manager.size;
		for (let module of this.module_manager().sets()) {
			let module_constructors = (await module()) as Record<
				string,
				{
					new (): Module & CommandInterface;
					create(store: ChatStore): Module & CommandInterface;
					NAME: string;
				}
			>;

			let modules = Object.entries(module_constructors);
			let modules_size = modules.length;
			if (modules_size > 1) {
				total_loaded += modules_size - 1;
			}

			for (let [module_name, module_constructor] of modules) {
				console.info(
					"Le module « %s » est maintenant en écoute.",
					module_name,
				);
				this.module_manager().set(
					module_constructor.NAME.toUpperCase(),
					module_constructor.create(this),
				);

				loaded += 1;

				this._overlayer.update_data<LayerData>("load-all-modules", {
					loaded,
					total_loaded,
					module_name,
				});
			}
		}

		

		this._handler_manager.free();
		this._module_manager.free();
		this._overlayer.destroy("load-all-modules");
	}

	play_audio(src: this["audio_src"])
	{
		let settings_notification = this.settings().notification;

		if (settings_notification.sounds.enabled === false) {
			return;
		}
		
		let key = `${src}s` as string;

		switch (src) {
			case "connection":
			{
				key = "connection";
			} break;

			case "query":
			{
				key = "queries";
			} break;
		}

		// @ts-expect-error
		if (!settings_notification.sounds[key]) {
			this.audio_src = null;
			return;
		}

		this.audio_src = src;
	}

	send_message(name: RoomID, message: string)
	{
		let maybe_room = this.room_manager().get(name, {
			where:{
				state: "opened",
				is_kicked: false,
			},
		});

		if (maybe_room.is_none()) {
			return;
		}

		let room = maybe_room.unwrap();

		room.add_input_history(message);

		if (!message.startsWith("/")) {
			let words = message.split(" ");

			if (room.name.startsWith("#")) {
				let module = this.module_manager().get("PUBMSG")
					.expect("Récupération du module `PUBMSG`");
				module.input(
					room.name,
					{
						format_bold: this._settings.personalization.formats.bold,
						format_italic: this._settings.personalization.formats.italic,
						format_underline: this._settings.personalization.formats.underline,
					},
					{
						color_background: this._settings.personalization.colors.background,
						color_foreground: this._settings.personalization.colors.foreground,
					},
					...words,
				);
			} else {
				let module = this.module_manager().get("PRIVMSG")
					.expect("Récupération du module `PRIVMSG`");
				module.input(
					room.name,
					{
						format_bold: this._settings.personalization.formats.bold,
						format_italic: this._settings.personalization.formats.italic,
						format_underline: this._settings.personalization.formats.underline,
					},
					{
						color_background: this._settings.personalization.colors.background,
						color_foreground: this._settings.personalization.colors.foreground,
					},
					...words,
				);
			}
			return;
		}

		let words = message.slice(1).split(" ");
		let [command_name, ...args] = words;

		let command_name_upper = command_name.toUpperCase() as CommandsNames;
		let maybe_module = this.module_manager().get(command_name_upper);

		if (maybe_module.is_none()) {
			console.error(
				"[%s]: le module « %s » n'a pas été trouvé.",
				ChatStore.NAME,
				command_name,
			);

			let [random_uuid] = this.uuid(7).take(1);
			this.room_manager().active().add_error_event(
				{
					origin: this.client(),
					tags: { msgid: random_uuid },
				},
				`La commande "/${command_name}" n'a pas été traité.`
			);
			return;
		}

		let module = maybe_module.unwrap();

		if (command_name_upper === "PUBMSG" || command_name_upper === "PRIVMSG")
		{
			args = [
				// @ts-expect-error : à corriger
				{
					format_bold: this._settings.personalization.formats.bold,
					format_italic: this._settings.personalization.formats.italic,
					format_underline: this._settings.personalization.formats.underline,
				},
				// @ts-expect-error : à corriger
				{
					color_background: this._settings.personalization.colors.background,
					color_foreground: this._settings.personalization.colors.foreground,
				},
				...args
			];
		}

		module.input(room.name, ...args);
	}

	// -------- //
	// Redirect //
	// -------- //

	overlayer(): OverlayerStore
	{
		return this._overlayer;
	}

	router(): Router
	{
		return this._router;
	}
	
	// @ts-expect-error - type à corriger
	settings()
	{
		return this._settings;
	}

	user(): UserStore
	{
		return this._user;
	}

	// ------- //
	// Méthode // -> ChatStoreUUIDExt
	// ------- //

	uuid(version: UUIDVariant): UUIDStore
	{
		if (version === 4) {
			return this._uuidv4;
		}

		return this._uuidv7;
	}
}

export const use_chat_store = define_store(ChatStoreVue.NAME, () => {
	let store = ChatStoreVue.default();
	let router = use_router();

	// Erreur client
	let client_error = computed(() => store.client_error);

	// Le client courant.
	let current_client = computed(() => store.client());
	
	// Le pseudo du client courant.
	let current_client_nickname = computed(() => current_client.value.nickname);

	
	// Toutes les chambres.
	let rooms = computed(() => store.room_manager().rooms());

	let servers = computed(() => {
		let network = store.network();
		return [
			{
				active: network.is_active(),
				connected: network.is_connected(),
				folded: false,
				id: network.id(),
				name: network.name,
				rooms: rooms.value,
			},
		];
	});

	// Liste des salons (récupérés préalablement via /LIST)
	let channels_list_arr = computed(() => store.get_channel_list());

	/**
	 * Émet la commande /LIST vers le serveur et redirige vers sa vue.
	 */
	function channel_list(channels?: Array<string>)
	{
		store.channel_list(channels || []);

		router.push({
			name: View.ChannelList,
			params: {
				servername: store.network_name(),
			},
		});
	}

	return {
		store,

		channels_list_arr,
		client_error,
		current_client,
		current_client_nickname,
		rooms,
		servers,

		// -------- //
		// Redirect //
		// -------- //

		all_commands: store.all_commands.bind(store),
		apply_channel_settings: store.apply_channel_settings.bind(store),
		ban_channel_member_mask: store.ban_channel_member_mask.bind(store),
		change_nick: store.change_nick.bind(store),
		change_room: store.change_room.bind(store),
		channel_list,
		check_user_is_blocked: store.check_user_is_blocked.bind(store),
		client: store.client.bind(store),
		close_room: store.close_room.bind(store),
		connect: store.connect.bind(store),
		get_current_selected_channel_member: store.get_current_selected_channel_member.bind(store),
		ignore_user: store.ignore_user.bind(store),
		is_connected: store.is_connected.bind(store),
		join_channel: store.join_channel.bind(store),
		kick_channel_member: store.kick_channel_member.bind(store),
		load_all_modules: store.load_all_modules.bind(store),
		listen: store.listen.bind(store),
		network: store.network.bind(store),
		open_private_or_create: store.open_private_or_create.bind(store),
		open_room: store.open_room.bind(store),
		room_manager: store.room_manager.bind(store),
		send_message: store.send_message.bind(store),
		send_set_access_level: store.send_set_access_level.bind(store),
		send_unset_access_level: store.send_unset_access_level.bind(store),
		toggle_select_channel_member: store.toggle_select_channel_member.bind(store),
		unban_channel_member_mask: store.unban_channel_member_mask.bind(store),
		unignore_user: store.unignore_user.bind(store),
		update_topic: store.update_topic.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(accept_hmr_update(use_chat_store, import.meta.hot));
}
