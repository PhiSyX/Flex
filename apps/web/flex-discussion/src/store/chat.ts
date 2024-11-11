// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { RouterContract } from "@phisyx/flex-architecture/router";
import type { PrivateRoom } from "@phisyx/flex-chat/private/room";
import type {
	ChatStoreInterfaceExt,
	ChatStoreUUIDExt,
	OverlayerStore,
	UUIDStore,
	UUIDVariant,
	UserStore,
} from "@phisyx/flex-chat/store";
import type { ComputedRef } from "vue";

import { is_string } from "@phisyx/flex-asserts/primitive";
import { is_channel, is_private_room } from "@phisyx/flex-chat/asserts/room";
import { ClientErrorLayer } from "@phisyx/flex-chat/layers/client_error";
import { ChatStore } from "@phisyx/flex-chat/store";
import { View } from "@phisyx/flex-chat/view";
import { None } from "@phisyx/flex-safety/option";
import {
	acceptHMRUpdate as accept_hmr_update,
	defineStore as define_store,
} from "pinia";
import { io } from "socket.io-client";
import { computed, reactive } from "vue";
import { useRouter as use_router } from "vue-router";
import { VueRouter } from "~/router";
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

	private _router = new VueRouter();

	private _overlayer = use_overlayer_store() as unknown as OverlayerStore;
	private _user = use_user_store() as unknown as UserStore;
	private _settings = use_settings_store();

	private _uuidv4 = useUUIDv4Store() as unknown as UUIDStore;
	private _uuidv7 = useUUIDv7Store() as unknown as UUIDStore;

	static default(): ChatStoreVue {
		let cs = reactive(new ChatStoreVue()) as ChatStoreVue;
		cs.room_manager().set_on_change((room_id) => {
			let servername = cs.network_name();

			if (is_channel(room_id)) {
				cs.router().goto(View.Channel, {
					params: {
						servername,
						channelname: room_id,
					},
				});
			} else if (is_string(room_id) && !room_id.startsWith("@")) {
				cs.router().goto(View.Private, {
					params: {
						id: room_id,
					},
				});
			} else {
				cs.router().goto(View.Chat);
			}
		});
		return cs;
	}

	// ------- //
	// Méthode // -> ChatStoreInterfaceExt
	// ------- //

	connect_websocket(websocket_server_url: string) {
		console.info(
			"Connexion au serveur de WebSocket « %s »",
			websocket_server_url,
		);

		let ws_url = new URL(websocket_server_url);
		let ws_path = ws_url.pathname;

		let client_id = this._client_id_storage.maybe().unwrap_or("") as
			| string
			| null;
		let user_id = this.user()
			.session()
			.map((u) => u.id)
			.unwrap_or("") as string | null;

		if (client_id?.length === 0) {
			client_id = null;
		}

		if (user_id?.length === 0) {
			user_id = null;
		}

		let wsio = <TypeSafeSocket>io(ws_url.origin, {
			auth: { user_id: user_id, client_id: client_id },
			path: ws_path,
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

	disconnect_error(comment: GenericReply<"ERROR"> | string) {
		this._overlayer.create({
			id: ClientErrorLayer.ID,
			centered: true,
			on_close: () => {
				this.client_error = None();
				window.location.reload();
			},
		});

		this.client_error.replace({
			id: ClientErrorLayer.ID,
			data: comment,
		});
	}

	play_audio(src: this["audio_src"]) {
		let settings_notification = this.settings().notification;

		if (settings_notification.sounds.enabled === false) {
			return;
		}

		let key = `${src}s` as string;

		switch (src) {
			case "connection":
				{
					key = "connection";
				}
				break;

			case "query":
				{
					key = "queries";
				}
				break;
		}

		// @ts-expect-error
		if (!settings_notification.sounds[key]) {
			this.audio_src = null;
			return;
		}

		this.audio_src = src;
	}

	send_message(name: RoomID, message: string) {
		let maybe_room = this.room_manager().get(name, {
			where: {
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
				let module = this.module_manager()
					.get("PUBMSG")
					.expect("Récupération du module `PUBMSG`");
				module.input(
					room.name,
					{
						format_bold:
							this._settings.personalization.formats.bold,
						format_italic:
							this._settings.personalization.formats.italic,
						format_underline:
							this._settings.personalization.formats.underline,
					},
					{
						color_background:
							this._settings.personalization.colors.background,
						color_foreground:
							this._settings.personalization.colors.foreground,
					},
					...words,
				);
			} else {
				let module = this.module_manager()
					.get("PRIVMSG")
					.expect("Récupération du module `PRIVMSG`");
				module.input(
					room.name,
					{
						format_bold:
							this._settings.personalization.formats.bold,
						format_italic:
							this._settings.personalization.formats.italic,
						format_underline:
							this._settings.personalization.formats.underline,
					},
					{
						color_background:
							this._settings.personalization.colors.background,
						color_foreground:
							this._settings.personalization.colors.foreground,
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
			this.room_manager()
				.active()
				.add_error_event(
					{
						origin: this.client(),
						tags: { msgid: random_uuid },
					},
					`La commande "/${command_name}" n'a pas été traité.`,
				);
			return;
		}

		let module = maybe_module.unwrap();

		if (
			command_name_upper === "PUBMSG" ||
			command_name_upper === "PRIVMSG"
		) {
			args = [
				// @ts-expect-error : à corriger
				{
					format_bold: this._settings.personalization.formats.bold,
					format_italic:
						this._settings.personalization.formats.italic,
					format_underline:
						this._settings.personalization.formats.underline,
				},
				// @ts-expect-error : à corriger
				{
					color_background:
						this._settings.personalization.colors.background,
					color_foreground:
						this._settings.personalization.colors.foreground,
				},
				...args,
			];
		}

		module.input(room.name, ...args);
	}

	// -------- //
	// Redirect //
	// -------- //

	overlayer() {
		return this._overlayer;
	}

	router(): RouterContract {
		return this._router;
	}

	// @ts-expect-error - type à corriger
	settings() {
		return this._settings;
	}

	user(): UserStore {
		return this._user;
	}

	// ------- //
	// Méthode // -> ChatStoreUUIDExt
	// ------- //

	uuid(version: UUIDVariant): UUIDStore {
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

	// Toutes les chambres privés en attente
	let privates_waiting: ComputedRef<Array<PrivateRoom>> = computed(
		() =>
			store
				.room_manager()
				.rooms()
				.filter((room) => {
					if (!is_private_room(room)) {
						return false;
					}
					return room.is_pending() && room.is_closed();
				}) as Array<PrivateRoom>,
	);

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

	/**
	 * Émet la commande /LIST vers le serveur et redirige vers sa vue.
	 */
	function channel_list(channels?: Array<string>) {
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

		client_error,
		current_client,
		current_client_nickname,
		privates_waiting,
		rooms,
		servers,

		// -------- //
		// Redirect //
		// -------- //

		accept_participant: store.accept_participant.bind(store),
		decline_participant: store.decline_participant.bind(store),
		all_commands: store.all_commands.bind(store),
		apply_channel_settings: store.apply_channel_settings.bind(store),
		change_nick: store.change_nick.bind(store),
		change_room: store.change_room.bind(store),
		channel_list,
		client: store.client.bind(store),
		close_room: store.close_room.bind(store),
		get_current_selected_channel_member:
			store.get_current_selected_channel_member.bind(store),
		ignore_user: store.ignore_user.bind(store),
		is_connected: store.is_connected.bind(store),
		join_channel: store.join_channel.bind(store),
		listen: store.listen.bind(store),
		network: store.network.bind(store),
		open_private_or_create: store.open_private_or_create.bind(store),
		open_room: store.open_room.bind(store),
		room_manager: store.room_manager.bind(store),
		send_message: store.send_message.bind(store),
		toggle_select_channel_member:
			store.toggle_select_channel_member.bind(store),
		unignore_user: store.unignore_user.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(accept_hmr_update(use_chat_store, import.meta.hot));
}
