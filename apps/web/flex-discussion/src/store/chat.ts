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
	ChannelMember,
	ChannelMemberSelected,
	ChannelRoom,
	ChatStoreInterfaceExt,
	ChatStoreUUIDExt,
	CommandInterface,
	ConnectUserInfo,
	Module,
	OverlayerStore,
	SettingsStore,
	UUIDStore,
	UUIDVariant,
	User,
	UserStore,
} from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";

import {
	acceptHMRUpdate as accept_hmr_update,
	defineStore as define_store
} from "pinia";
import { io } from "socket.io-client";
import { reactive } from "vue";
import { useRouter as use_router } from "vue-router";

import { is_string } from "@phisyx/flex-asserts";
import {
	ChannelAccessLevelFlag, ChatStore,
	PrivateParticipant,
	PrivateRoom,
	View,
	assert_channel_room,
	is_channel
} from "@phisyx/flex-chat";
import { None } from "@phisyx/flex-safety";

import { use_overlayer_store } from "./overlayer";
import { use_settings_store } from "./settings";
import { use_user_store } from "./user";
import { useUUIDv4Store, useUUIDv7Store } from "./uuid";

// -------------- //
// Implémentation //
// -------------- //

export class ChatStoreVue 
	extends ChatStore 
	implements ChatStoreInterfaceExt, ChatStoreUUIDExt
{
	audio_src: ChatStoreInterfaceExt["audio_src"] = null;

	private _router = use_router();

	private _overlayer = use_overlayer_store() as unknown as OverlayerStore;
	private _user = use_user_store() as unknown as UserStore;
	private _settings = use_settings_store() as unknown as SettingsStore;

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

	/**
	 * Connexion au serveur de Chat WebSocket.
	 */
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

	/**
	 * Déconnexion du client liée à un événement d'erreur.
	 */
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

	/**
	 * Charge tous les modules du Chat.
	 */
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


	overlayer(): OverlayerStore
	{
		return this._overlayer;
	}

	router(): Router
	{
		return this._router;
	}
	
	settings(): SettingsStore
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
	let settings_store = use_settings_store();

	/**
	 * Toutes les commandes basées sur les noms de modules.
	 */
	function all_commands()
	{
		return Array.from(
			store.module_manager().modules().keys(),
			(k) => `/${k.toLowerCase()}`,
		).sort();
	}

	/**
	 * Applique les paramètres d'un salon.
	 */
	function apply_channel_settings(
		target: string,
		modes_settings: Command<"MODE">["modes"],
	)
	{
		let module = store.module_manager().get("MODE")
			.expect("Récupération du module `MODE`");
		module.send({ target, modes: modes_settings });
	}

	/**
	 * Change le pseudonyme de l'utilisateur actuel.
	 */
	function change_nick(new_nick: string)
	{
		let module = store.module_manager().get("NICK")
			.expect("Récupération du module `NICK`");
		module.send({ nickname: new_nick });
	}

	/**
	 * Change de chambre.
	 */
	function change_room(target: Origin | RoomID)
	{
		let room_id: RoomID;

		if (is_string(target)) {
			room_id = target;
		} else {
			room_id = target.id;
		}

		if (!store.room_manager().has(room_id)) {
			return;
		}

		store.room_manager().set_current(room_id);
	}

	/**
	 * Émet la commande /LIST vers le serveur.
	 */
	function channel_list(channels?: Array<string>)
	{
		store.module_manager().get_unchecked("LIST")?.send({ channels });

		router.push({
			name: View.ChannelList,
			params: {
				servername: store.network_name(),
			},
		});
	}

	/**
	 * Vérifie qu'un utilisateur est bloqué.
	 */
	function check_user_is_blocked(user: User): boolean
	{
		return store.user_manager().is_blocked(user.id);
	}

	/**
	 * Ferme une chambre. Dans le cas d'un salon, cette fonction émet la
	 * commande /PART vers le serveur.
	 */
	function close_room(target: Origin | RoomID, message?: string)
	{
		let room_id: RoomID;
		if (is_string(target)) {
			room_id = target;
		} else {
			room_id = target.id;
		}

		if (!is_channel(room_id)) {
			store.room_manager().close(room_id);
			return;
		}

		store.module_manager().get_unchecked("PART")?.send({
			channels: [room_id],
			message,
		});
	}

	/**
	 * Se connecte au serveur de Chat.
	 */
	function connect(connect_user_info: ConnectUserInfo)
	{
		store.set_connect_user_info(connect_user_info);
		store.connect_websocket(connect_user_info.websocket_server_url);

		if (import.meta.env.DEV) {
			store.websocket().onAnyOutgoing((event_name, ...payload) => {
				console.groupCollapsed("> Event %s", event_name);
				console.debug("Données envoyées:");
				console.table(payload);
				console.groupEnd();
			});

			store.websocket().onAny((event_name, ...payload) => {
				console.groupCollapsed("< Event %s", event_name);
				console.debug("Données reçues:");
				console.table(payload);
				console.groupEnd();
			});
		}

		store.websocket().once("connect", () => {
			for (let [_, handler] of store.handler_manager().handlers()) {
				handler.listen();
			}
			for (let [_, module] of store.module_manager().modules()) {
				module.listen();
			}

			if (connect_user_info.password_server) {
				store.emit("PASS", {
					password: connect_user_info.password_server,
				});
			}

			store.emit("NICK (unregistered)", {
				nickname: connect_user_info.nickname,
			});
			
			store.emit("USER", {
				user: connect_user_info.nickname,
				mode: 1 << 3,
				realname: connect_user_info.realname,
			});

			store.websocket().once("disconnect", (reason) => {
				setTimeout(() => store.disconnect_error(reason), 1_500);
			});
		});
	}

	/**
	 * @see ChatStore#get_current_selected_channel_member
	 */
	function get_current_selected_channel_member(
		room: ChannelRoom,
	): Option<ChannelMemberSelected>
	{
		return store.get_current_selected_channel_member(room);
	}

	/**
	 * Émet la commande /SILENCE +nickname vers le serveur.
	 */
	function ignore_user(nickname: string)
	{
		let module = store.module_manager().get("SILENCE")
			.expect("Récupération du module `SILENCE`");
		module.send({ nickname: `+${nickname}` });
	}

	/**
	 * Émet la commande /JOIN vers le serveur.
	 */
	function join_channel(channels_raw: ChannelID, keys_raw?: string)
	{
		let module = store.module_manager().get("JOIN")
			.expect("Récupération du module `JOIN`");
		let channels = channels_raw.split(",") as Array<ChannelID>;
		let keys = keys_raw?.split(",");
		module.send({ channels, keys });
	}

	/**
	 * Émet la commande /KICK vers le serveur.
	 */
	function kick_channel_member(
		channel: ChannelRoom,
		member: ChannelMember,
		comment = "Kick.",
	)
	{
		let module = store.module_manager().get("KICK")
			.expect("Récupération du module `KICK`");
		module.send({
			channels: [channel.name],
			knicks: [member.nickname],
			comment,
		});
	}

	/**
	 * Écoute un événement donnée.
	 */
	function listen<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
		options: { once: boolean } = { once: false },
	)
	{
		if (options.once) {
			store.once(event_name, listener);
		} else {
			store.on(event_name, listener);
		}
	}

	/**
	 * Ouvre un privé ou le crée.
	 */
	function open_private_or_create(origin: Origin)
	{
		let room = store.room_manager().get_or_insert(origin.id, () => {
			let priv = new PrivateRoom(origin.nickname).with_id(origin.id);
			priv.add_participant(
				new PrivateParticipant(store.client())
					.with_is_current_client(true),
			);
			let maybe_user = store.user_manager().find(origin.id);
			maybe_user.then((user) =>
				priv.add_participant(new PrivateParticipant(user)),
			);
			return priv;
		});

		room.marks_as_opened();

		store.room_manager().set_current(room.id());

		// store.emit("QUERY", { nickname: name });
	}

	/**
	 * Ouvre une chambre. Dans le cas d'un salon, cette fonction émet la
	 * commande /JOIN vers le serveur (sans clés).
	 */
	function open_room(target: Origin | RoomID)
	{
		let room_id: RoomID;
		if (is_string(target)) {
			room_id = target;
		} else {
			room_id = target.id;
		}

		if (!is_channel(room_id)) {
			store.room_manager().set_current(room_id);
			return;
		}

		if (store.room_manager().has(room_id)) {
			let channel = store.room_manager().get(room_id).unwrap();
			assert_channel_room(channel);
			if (!channel.is_closed() && !channel.kicked) {
				return;
			}
		}

		let module = store.module_manager().get("JOIN")
			.expect("Récupération du module `JOIN`");
		module.send({ channels: [room_id] });
	}

	/**
	 * (Dé-)sélectionne un utilisateur d'un salon.
	 */
	function toggle_select_channel_member(room: ChannelRoom, origin: Origin)
	{
		let maybe_selected_channel_member = store.get_current_selected_channel_member(room);
		if (maybe_selected_channel_member.is_some()) {
			let selected_channel_member = maybe_selected_channel_member.unwrap();
			if (selected_channel_member.member.id === origin.id) {
				store.unset_selected_user(room, origin);
			} else {
				store.set_selected_user(room, origin);
			}
		} else {
			store.set_selected_user(room, origin);
		}
	}

	/**
	 * Émet les commandes au serveur.
	 */
	function send_message(name: RoomID, message: string)
	{
		let maybe_room = store.room_manager().get(name, {
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

			if (name.startsWith("#")) {
				let module = store.module_manager().get("PUBMSG")
					.expect("Récupération du module `PUBMSG`");
				module.input(
					name,
					{
						format_bold: settings_store.personalization.formats.bold,
						format_italic: settings_store.personalization.formats.italic,
						format_underline: settings_store.personalization.formats.underline,
					},
					{
						color_background: settings_store.personalization.colors.background,
						color_foreground: settings_store.personalization.colors.foreground,
					},
					...words,
				);
			} else {
				let module = store.module_manager().get("PRIVMSG")
					.expect("Récupération du module `PRIVMSG`");
				module.input(
					name,
					{
						format_bold: settings_store.personalization.formats.bold,
						format_italic: settings_store.personalization.formats.italic,
						format_underline: settings_store.personalization.formats.underline,
					},
					{
						color_background: settings_store.personalization.colors.background,
						color_foreground: settings_store.personalization.colors.foreground,
					},
					...words,
				);
			}
			return;
		}

		let words = message.slice(1).split(" ");
		let [command_name, ...args] = words;

		let command_name_upper = command_name.toUpperCase() as CommandsNames;
		let maybe_module = store.module_manager().get(command_name_upper);

		if (maybe_module.is_none()) {
			console.error(
				"[%s]: le module « %s » n'a pas été trouvé.",
				ChatStore.NAME,
				command_name,
			);

			let [random_uuid] = store.uuid(7).take(1);
			store.room_manager().active().add_error_event(
				{
					origin: store.client(),
					tags: { msgid: random_uuid },
				},
				`La commande "/${command_name}" n'a pas été traité.`
			);
			return;
		}

		let module = maybe_module.unwrap();

		module.input(name, ...args);
	}

	/**
	 * Émet les commandes liées aux niveaux d'accès vers le serveur.
	 */
	function send_set_access_level(
		channel: ChannelRoom,
		member: ChannelMember,
		access_level: ChannelAccessLevelFlag,
	)
	{
		let payload = { channel: channel.name, nicknames: [member.nickname] };

		let maybe_module: Option<CommandInterface<"OP">> = None();

		switch (access_level) {
			case ChannelAccessLevelFlag.Owner:
				maybe_module = store.module_manager().get("QOP");
				break;
			case ChannelAccessLevelFlag.AdminOperator:
				maybe_module = store.module_manager().get("AOP");
				break;
			case ChannelAccessLevelFlag.Operator:
				maybe_module = store.module_manager().get("OP");
				break;
			case ChannelAccessLevelFlag.HalfOperator:
				maybe_module = store.module_manager().get("HOP");
				break;
			case ChannelAccessLevelFlag.Vip:
				maybe_module = store.module_manager().get("VIP");
				break;
		}

		let module = maybe_module.expect(
			`Récupération du module \`AccessLevel (${access_level})\``,
		);

		module.send(payload);
	}

	/**
	 * Émet les commandes liées aux niveaux d'accès vers le serveur.
	 */
	function send_unset_access_level(
		channel: ChannelRoom,
		member: ChannelMember,
		access_level: ChannelAccessLevelFlag,
	)
	{
		let payload = { channel: channel.name, nicknames: [member.nickname] };

		let maybe_module: Option<CommandInterface<"OP">> = None();

		switch (access_level) {
			case ChannelAccessLevelFlag.Owner:
				maybe_module = store.module_manager().get("DEQOP");
				break;
			case ChannelAccessLevelFlag.AdminOperator:
				maybe_module = store.module_manager().get("DEAOP");
				break;
			case ChannelAccessLevelFlag.Operator:
				maybe_module = store.module_manager().get("DEOP");
				break;
			case ChannelAccessLevelFlag.HalfOperator:
				maybe_module = store.module_manager().get("DEHOP");
				break;
			case ChannelAccessLevelFlag.Vip:
				maybe_module = store.module_manager().get("DEVIP");
				break;
		}

		let module = maybe_module.expect(
			`Récupération du module \`AccessLevel (${access_level})\``,
		);

		module?.send(payload);
	}

	/**
	 * Émet la commande /SILENCE - vers le serveur.
	 */
	function unignore_user(nickname: string)
	{
		let module = store.module_manager().get("SILENCE")
			.expect("Récupération du module `SILENCE`");
		module.send({ nickname: `-${nickname}` });
	}

	/**
	 * Émet la commande /TOPIC vers le serveur.
	 */
	function update_topic(channel_name: ChannelID, topic?: string)
	{
		let module = store.module_manager().get("TOPIC")
			.expect("Récupération du module `TOPIC`");
		module.send({ channel: channel_name, topic });
	}

	/**
	 * Émet la commande /BAN vers le serveur.
	 */
	function ban_channel_member_mask(channel: ChannelRoom, mask: MaskAddr)
	{
		let module = store.module_manager().get("BAN")
			.expect("Récupération du module `BAN`");
		module.send({ channels: [channel.name], masks: [mask] });
	}

	/**
	 * Émet la commande /UNBAN vers le serveur.
	 */
	function unban_channel_member_mask(channel: ChannelRoom, mask: MaskAddr)
	{
		let module = store.module_manager().get("UNBAN")
			.expect("Récupération du module `UNBAN`");
		module.send({ channels: [channel.name], masks: [mask] });
	}

	return {
		store,

		all_commands,
		apply_channel_settings,
		ban_channel_member_mask,
		change_nick,
		change_room,
		channel_list,
		check_user_is_blocked,
		close_room,
		connect,
		get_current_selected_channel_member,
		ignore_user,
		join_channel,
		kick_channel_member,
		listen,
		open_private_or_create,
		open_room,
		send_message,
		send_set_access_level,
		send_unset_access_level,
		toggle_select_channel_member,
		unban_channel_member_mask,
		unignore_user,
		update_topic,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(accept_hmr_update(use_chat_store, import.meta.hot));
}
