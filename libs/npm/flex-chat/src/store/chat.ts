// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";

import type { ChannelRoom } from "../channel/room";
import type { OverlayerStore } from "./overlayer";
import type { SettingsStore } from "./settings";

import { is_string } from "@phisyx/flex-asserts";
import { None } from "@phisyx/flex-safety";

import { assert_channel_room } from "../asserts/room";
import { ChannelMemberSelected } from "../channel/member/selected";
import { ChannelListCustomRoom } from "../custom_room/channel_list";
import { ServerCustomRoom } from "../custom_room/server";
import { HandlerManager } from "../handlers/manager";
import { ClientIDStorage } from "../localstorage/client_id";
import { ModuleManager } from "../modules/manager";
import { RoomManager } from "../room/manager";
import { UserManager } from "../user/manager";

// -------- //
// Constant //
// -------- //

// @ts-ignore : Vite
const HANDLERS = import.meta.glob("../handlers/*/*.ts");
// @ts-ignore : Vite
const MODULES = import.meta.glob("../modules/**/module.ts");
// @ts-ignore : Vite
const MODULES_REPLIES_HANDLERS = import.meta.glob("../modules/**/replies.ts");

// ---- //
// Type //
// ---- //

export interface ConnectUserInfo
{
	channels: ChannelID;
	alternative_nickname: string;
	nickname: string;
	password_server: string | null;
	realname: string;
	websocket_server_url: string;
};

export interface ChatStoreInterface
{
	client_error: Option<{
		id: string;
		title?: string;
		subtitle?: string;
		problems?: HttpProblemErrorResponse["errors"];
		data: unknown;
	}>;

	/**
	 * Chambre personnalisé liste des salons.
	 */
	channel_list(): ChannelListCustomRoom;

	/**
	 * ID du client actuellement connecté à l'application.
	 */
	client_id(): UserID;

	/**
	 * L'utilisateur actuellement connecté à l'application.
	 */
	client(): Origin;

	/**
	 * Méthode d'émission de données vers le serveur WebSocket.
	 */
	emit<E extends keyof Commands>(
		event_name: E,
		...payload: Parameters<ClientToServerEvent[E]>
	): void;

	/**
	 * Récupère les salons à rejoindre automatiquement.
	 */
	get_auto_join_channels(): Array<ChannelID>;

	/**
	 * Récupère les informations de connexion de l'utilisateur.
	 */
	get_connect_user_info(): ConnectUserInfo;

	/**
	 * Récupère l'utilisateur sélectionné d'un salon.
	 */
	get_current_selected_channel_member(
		room: ChannelRoom,
	): Option<ChannelMemberSelected>;

	/**
	 * Vérifie que le client est connecté au serveur.
	 */
	is_connected(): boolean;

	/**
	 * Vérifie qu'une origine correspond à l'utilisateur actuellement connecté
	 * à l'application.
	 */
	is_current_client(origin: Origin | string): boolean;

	/**
	 * Gestion des handlers.
	 */
	handler_manager(): HandlerManager;

	/**
	 * Gestion des modules.
	 */
	module_manager(): ModuleManager;

	/**
	 * La chambre personnalisée du serveur.
	 */
	network(): ServerCustomRoom;

	/**
	 * Le nom du serveur.
	 */
	network_name(): CustomRoomID;

	/**
	 * Le pseudonyme du client actuellement connecté à l'application.
	 */
	nickname(): string;

	/**
	 * Désactive un événement.
	 */
	off<K extends keyof ServerToClientEvent>(event_name: K): void;

	/**
	 * Active/écoute un événement.
	 */
	on<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
	): void;

	/**
	 * Active/écoute un événement une seule et unique fois.
	 */
	once<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
	): void;

	/**
	 * Gestion des chambres.
	 */
	room_manager(): RoomManager;

	/**
	 * Définit les informations de connexion du formulaire d'accès direct au
	 * Chat de l'utilisateur.
	 */
	set_connect_user_info(connect_user_info: ConnectUserInfo): void;

	/**
	 * Définit l'application comme étant connecté au serveur.
	 */
	set_connected(b: boolean): void;

	/**
	 * Définit l'origine du client.
	 */
	set_client(origin: Origin): void;

	/**
	 * Définit l'ID de l'utilisateur.
	 */
	set_user_id(user_id: UUID): void;

	/**
	 * Définit le nom du serveur.
	 */
	set_network_name(network_name: CustomRoomID): void;

	/**
	 * Définit un nouvel ID au client connecté au serveur.
	 */
	set_client_id(id: UserID): void;

	/**
	 * Définit le nom du client connecté au serveur.
	 */
	set_client_nickname(nickname: string): void;

	/**
	 * Définit l'utilisateur sélectionné d'un salon.
	 */
	set_selected_user(room: ChannelRoom, origin: Origin): void;

	/**
	 * Désélectionne un utilisateur d'un salon.
	 */
	unset_selected_user(room: ChannelRoom, origin: Origin): void;

	/**
	 * Gestion des utilisateurs.
	 */
	user_manager(): UserManager;

	/**
	 * Instance de la WebSocket.
	 */
	websocket(): TypeSafeSocket;
}

export interface ChatStoreInterfaceExt
{
	audio_src: "connection" | "invite" | "mention" | "notice" | "query" | null;

	/**
	 * Connexion au serveur de Chat WebSocket.
	 */
	connect_websocket(websocket_server_url: string): void;

	/**
	 * Déconnexion du client liée à un événement d'erreur.
	 */
	disconnect_error(comment: GenericReply<"ERROR"> | string): void;

	/**
	 * Charge tous les modules du Chat.
	 */
	load_all_modules(): Promise<void>;

	/**
	 * Joue un audio.
	 */
	play_audio(src: this["audio_src"]): void;

	overlayer(): OverlayerStore;
	settings(): SettingsStore;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChatStore implements ChatStoreInterface
{
	// ------ //
	// Static //
	// ------ //

	static readonly NAME = "chat-store";

	// --------- //
	// Propriété //
	// --------- //

	private _connect_user_info: Option<ConnectUserInfo> = None();
	private _client: Option<Origin> = None();
	public client_error: Option<{
		id: string;
		title?: string;
		subtitle?: string;
		problems?: HttpProblemErrorResponse["errors"];
		data: unknown;
	}> = None();
	protected _client_id_storage: ClientIDStorage = new ClientIDStorage();
	protected _user_id: Option<UUID> = None();
	private _network: Option<CustomRoomID> = None();
	private _room_manager: RoomManager = new RoomManager();
	protected _ws: Option<TypeSafeSocket> = None();
	private _user_manager: UserManager = new UserManager();

	protected _handler_manager = new HandlerManager();
	protected _module_manager = new ModuleManager();

	constructor()
	{
		this._handler_manager
			.extends(HANDLERS)
			.extends(MODULES_REPLIES_HANDLERS);
		this._module_manager.extends(MODULES);

		let this_server = new ServerCustomRoom();
		let channel_list = new ChannelListCustomRoom();

		this.set_network_name(this_server.id());
		this.room_manager().extends([
			[this_server.id(), this_server],
			[channel_list.id(), channel_list],
		]);
		this.room_manager().set_current(this_server.id());
	}

	// ------- //
	// Méthode // -> Interface
	// ------- //

	channel_list(): ChannelListCustomRoom
	{
		return this.room_manager()
			.get(ChannelListCustomRoom.ID)
			.unwrap_unchecked() as ChannelListCustomRoom;
	}

	client_id(): UserID
	{
		return this.client().id;
	}

	client(): Origin
	{
		return this._client.expect("Le client courant connecté");
	}

	emit<E extends keyof Commands>(
		event_name: E,
		...payload: Parameters<ClientToServerEvent[E]>
	)
	{
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.emit(event_name, ...payload);
	}

	get_auto_join_channels(): Array<ChannelID>
	{
		let channels: ChannelID = this.get_connect_user_info().channels;
		return channels.split(",") as Array<ChannelID>;
	}

	get_connect_user_info(): ConnectUserInfo
	{
		return this._connect_user_info.expect(
			"Information de connexion de l'utilisateur",
		);
	}

	get_current_selected_channel_member(room: ChannelRoom): Option<ChannelMemberSelected>
	{
		return this.room_manager()
			.get(room.id())
			.and_then((room) => {
				assert_channel_room(room);
				return room.members.selected();
			})
			.map((member) => {
				let channel_member_selected = new ChannelMemberSelected(
					member,
					this.user_manager().is_blocked(member.id),
				).with_banned(room.find_ban(member));
				return channel_member_selected;
			});
	}

	is_connected(): boolean
	{
		return this.network().is_connected();
	}

	is_current_client(origin: Origin | string): boolean
	{
		if (is_string(origin)) {
			return (
				this.client().id === origin ||
				this.client().nickname.toLowerCase() === origin.toLowerCase()
			);
		}

		return this.client().id === origin.id;
	}

	handler_manager(): HandlerManager
	{
		return this._handler_manager;
	}

	module_manager(): ModuleManager
	{
		return this._module_manager;
	}

	network(): ServerCustomRoom
	{
		return this.room_manager()
			.get(this.network_name())
			.as<ServerCustomRoom>()
			.unwrap_unchecked();
	}

	network_name(): CustomRoomID
	{
		return this._network.expect("Nom du réseau");
	}

	nickname(): string
	{
		return this.client().nickname;
	}

	off<K extends keyof ServerToClientEvent>(event_name: K)
	{
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.off(event_name);
	}

	on<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
	)
	{
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.on(event_name, listener);
	}

	once<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
	)
	{
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.once(event_name, listener);
	}

	room_manager(): RoomManager
	{
		return this._room_manager;
	}

	set_connect_user_info(connect_user_info: ConnectUserInfo)
	{
		this._connect_user_info.replace(connect_user_info);
	}

	set_connected(b: boolean)
	{
		this.network().set_connected(b);
	}

	set_client(origin: Origin)
	{
		this._client_id_storage.set(origin.id);
		this._client.replace(origin);
	}

	set_user_id(user_id: UUID)
	{
		this._user_id.replace(user_id);
	}

	set_network_name(network_name: CustomRoomID)
	{
		this._network.replace(network_name);
	}

	set_client_id(id: UserID)
	{
		this.client().id = id;
	}

	set_client_nickname(nickname: string)
	{
		this.client().nickname = nickname;
	}

	set_selected_user(room: ChannelRoom, origin: Origin)
	{
		room.members.select(origin.id);
	}

	unset_selected_user(room: ChannelRoom, origin: Origin)
	{
		room.members.unselect(origin.id);
	}

	user_manager(): UserManager
	{
		return this._user_manager;
	}

	websocket(): TypeSafeSocket
	{
		return this._ws.expect("Instance WebSocket connecté au serveur");
	}
}
