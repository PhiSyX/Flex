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
import type { Room } from "../room";
import type { OverlayerStore } from "./overlayer";
import type { SettingsStore } from "./settings";
import type { UserStore } from "./user";

import { is_string } from "@phisyx/flex-asserts";
import { None } from "@phisyx/flex-safety";

import {
	assert_channel_room,
	assert_private_room,
	is_channel,
} from "../asserts/room";
import { ChannelMemberSelected } from "../channel/member/selected";
import { ServerCustomRoom } from "../custom_room/server";
import { MODULES } from "../modules";
import { ModuleManager } from "../modules/manager";
import { PrivateParticipant } from "../private/participant";
import { PrivateRoom } from "../private/room";
import { RoomManager } from "../room/manager";
import { ClientIDStorage } from "../sessionstorage/client_id";
import { UserManager } from "../user/manager";

// ---- //
// Type //
// ---- //

export interface ConnectUserInfo {
	channels: ChannelID;
	alternative_nickname: string;
	nickname: string;
	password_server: string | null;
	realname: string;
	websocket_server_url: string;
}

export interface ChatStoreInterface {
	client_error: Option<{
		id: string;
		title?: string;
		subtitle?: string;
		problems?: HttpProblemErrorResponse["errors"];
		data: unknown;
	}>;

	/**
	 * Accepte un privé en attente.
	 */
	accept_participant(participant: PrivateParticipant): void;

	/**
	 * Décline un privé en attente.
	 */
	decline_participant(participant: PrivateParticipant): void;

	/**
	 * Toutes les commandes d'une chambre. En fonction de la chambre active.
	 *
	 * 1. Tous les salons.
	 * 2. Les membres de la chambre.
	 * 3. Toutes les commandes.
	 */
	all_commands(room: Room): Array<string>;

	/**
	 * Applique des paramètres de salon.
	 */
	apply_channel_settings(
		target: string,
		modes_settings: Command<"MODE">["modes"],
	): void;

	/**
	 * Change le pseudonyme de l'utilisateur actuel.
	 */
	change_nick(new_nick: string): void;

	/**
	 * Change de chambre.
	 */
	change_room(target: Origin | RoomID): void;

	/**
	 * Émet la commande /LIST vers le serveur.
	 */
	channel_list(targets: Array<string>): void;

	/**
	 * Ferme une chambre. Dans le cas d'un salon, cette fonction émet la
	 * commande /PART vers le serveur.
	 */
	close_room(target: Origin | RoomID, message?: string): void;

	/**
	 * Supprime la liste des salons du serveur.
	 */
	clear_channels_list(): void;

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
	 * Supprime la liste des salons du serveur.
	 */
	get_channels_list(): Array<GenericReply<"RPL_LIST">>;

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
	 * Émet la commande /SILENCE +nickname vers le serveur.
	 */
	ignore_user(nickname: string): void;

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
	 * Émet la commande /JOIN vers le serveur.
	 */
	join_channel(channels_raw: ChannelID, keys_raw?: string): void;

	/**
	 * Écoute un événement donnée.
	 */
	listen<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
		options?: { once: boolean },
	): void;

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
	 * Ouvre un privé ou le crée.
	 */
	open_private_or_create(origin: Origin): void;

	/**
	 * Ouvre une chambre. Dans le cas d'un salon, cette fonction émet la
	 * commande /JOIN vers le serveur (sans clés).
	 */
	open_room(target: Origin | RoomID): void;

	/**
	 * Gestion des chambres.
	 */
	room_manager(): RoomManager;

	/**
	 * Gestion des modules.
	 */
	module_manager(): ModuleManager;

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
	 * Définit la liste des salons.
	 */
	add_channels_list(list: GenericReply<"RPL_LIST">): void;

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
	set_selected_user(channel_name: ChannelID, origin: Origin): void;

	/**
	 * (Dé-)sélectionne un utilisateur d'un salon.
	 */
	toggle_select_channel_member(room: ChannelRoom, origin: Origin): void;

	/**
	 * Émet la commande /SILENCE - vers le serveur.
	 */
	unignore_user(nickname: string): void;

	/**
	 * Désélectionne un utilisateur d'un salon.
	 */
	unset_selected_user(channel_name: ChannelID, origin: Origin): void;

	/**
	 * Gestion des utilisateurs.
	 */
	user_manager(): UserManager;

	/**
	 * Instance de la WebSocket.
	 */
	websocket(): TypeSafeSocket;
}

export interface ChatStoreInterfaceExt {
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

	/**
	 * Émet les commandes au serveur.
	 */
	send_message(name: RoomID, message: string): void;

	overlayer(): OverlayerStore;
	settings(): SettingsStore;
	user(): UserStore;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChatStore implements ChatStoreInterface {
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
	private _channels_list: Array<GenericReply<"RPL_LIST">> = [];
	protected _client_id_storage: ClientIDStorage = new ClientIDStorage();
	private _network: Option<CustomRoomID> = None();
	private _room_manager: RoomManager = new RoomManager();
	protected _ws: Option<TypeSafeSocket> = None();
	private _user_manager: UserManager = new UserManager();

	protected _module_manager = new ModuleManager().extends(MODULES);

	constructor() {
		let this_server = new ServerCustomRoom();

		this.set_network_name(this_server.id());
		this.room_manager().extends([[this_server.id(), this_server]]);
		this.room_manager().set_current(this_server.id());
	}

	// ------- //
	// Méthode // -> Interface
	// ------- //

	accept_participant(participant: PrivateParticipant) {
		let maybe_priv = this.room_manager().get(participant.id);
		if (maybe_priv.is_none()) {
			return;
		}
		let priv = maybe_priv.unwrap();
		assert_private_room(priv);
		priv.set_pending(false);
		priv.marks_as_opened();
		this.room_manager().set_current(participant.id);
	}

	decline_participant(participant: PrivateParticipant) {
		let maybe_priv = this.room_manager().get(participant.id);
		if (maybe_priv.is_none()) {
			return;
		}
		let priv = maybe_priv.unwrap();
		assert_private_room(priv);
		priv.set_pending(true);
		priv.marks_as_closed();
		this.room_manager().set_current_to_last();
	}

	all_commands(room: Room): Array<string> {
		let modules = Array.from(
			this.module_manager().modules().keys(),
			(mod) => `/${mod.toLowerCase()}`,
		).sort();

		let rooms = this._room_manager.rooms().map((room) => room.name);

		let base_commands = [room.name, ...rooms, ...modules];

		if (room.type === "channel") {
			assert_channel_room(room);
			let members = room.members.all.map((user) => user.nickname);
			return [...base_commands, ...members];
		}

		if (room.type === "private") {
			assert_private_room(room);
			let participants = Array.from(
				room.participants,
				([_, user]) => user.nickname,
			);
			return [...base_commands, ...participants];
		}

		return base_commands;
	}

	apply_channel_settings(
		target: string,
		modes_settings: Command<"MODE">["modes"],
	) {
		let module = this.module_manager()
			.get("MODE")
			.expect("Récupération du module `MODE`");
		module.send({ target, modes: modes_settings });
	}

	change_nick(new_nick: string) {
		let module = this.module_manager()
			.get("NICK")
			.expect("Récupération du module `NICK`");
		module.send({ nickname: new_nick });
	}

	change_room(target: Origin | RoomID) {
		let room_id: RoomID;

		if (is_string(target)) {
			room_id = target;
		} else {
			room_id = target.id;
		}

		if (!this.room_manager().has(room_id)) {
			return;
		}

		this.room_manager().set_current(room_id);
	}

	channel_list(channels: Array<string>) {
		this.module_manager()
			.get("LIST")
			.expect("Module `LIST`")
			.send({ channels });
	}

	close_room(target: Origin | RoomID, message?: string) {
		let room_id: RoomID;
		if (is_string(target)) {
			room_id = target;
		} else {
			room_id = target.id;
		}

		if (!is_channel(room_id)) {
			this.room_manager().close(room_id);
			return;
		}

		this.module_manager()
			.get_unchecked("PART")
			?.send({
				channels: [room_id],
				message,
			});
	}

	clear_channels_list() {
		this._channels_list = [];
	}

	client_id(): UserID {
		return this.client().id;
	}

	client(): Origin {
		return this._client.expect("Le client courant connecté");
	}

	emit<E extends keyof Commands>(
		event_name: E,
		...payload: Parameters<ClientToServerEvent[E]>
	) {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.emit(event_name, ...payload);
	}

	get_auto_join_channels(): Array<ChannelID> {
		let channels: ChannelID = this.get_connect_user_info().channels;
		return channels.split(",") as Array<ChannelID>;
	}

	get_channels_list(): Array<GenericReply<"RPL_LIST">> {
		return this._channels_list;
	}

	get_connect_user_info(): ConnectUserInfo {
		return this._connect_user_info.expect(
			"Information de connexion de l'utilisateur",
		);
	}

	get_current_selected_channel_member(
		channel: ChannelRoom,
	): Option<ChannelMemberSelected> {
		return this.room_manager()
			.get(channel.id())
			.and_then((room) => {
				assert_channel_room(room);
				return room.members.selected();
			})
			.map((member) => {
				let channel_member_selected = new ChannelMemberSelected(
					member,
					this.user_manager().is_blocked(member.id),
				).with_banned(channel.find_ban(member));
				return channel_member_selected;
			});
	}

	module_manager(): ModuleManager {
		return this._module_manager;
	}

	ignore_user(nickname: string) {
		let module = this.module_manager()
			.get("SILENCE")
			.expect("Récupération du module `SILENCE`");
		module.send({ nickname: `+${nickname}` });
	}

	is_connected(): boolean {
		return this.network().is_connected();
	}

	is_current_client(origin: Origin | string): boolean {
		if (is_string(origin)) {
			return (
				this.client().id === origin ||
				this.client().nickname.toLowerCase() === origin.toLowerCase()
			);
		}

		return this.client().id === origin.id;
	}

	join_channel(channels_raw: ChannelID, keys_raw?: string) {
		let module = this.module_manager()
			.get("JOIN")
			.expect("Récupération du module `JOIN`");
		let channels = channels_raw.split(",") as Array<ChannelID>;
		let keys = keys_raw?.split(",");
		module.send({ channels, keys });
	}

	listen<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
		options: { once: boolean } = { once: false },
	) {
		if (options.once) {
			this.once(event_name, listener);
		} else {
			this.on(event_name, listener);
		}
	}

	network(): ServerCustomRoom {
		return this.room_manager()
			.get(this.network_name())
			.as<ServerCustomRoom>()
			.unwrap_unchecked();
	}

	network_name(): CustomRoomID {
		return this._network.expect("Nom du réseau");
	}

	nickname(): string {
		return this.client().nickname;
	}

	off<K extends keyof ServerToClientEvent>(event_name: K) {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.off(event_name);
	}

	on<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
	) {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.on(event_name, listener);
	}

	once<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
	) {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.once(event_name, listener);
	}

	open_private_or_create(origin: Origin) {
		let room = this.room_manager().get_or_insert(origin.id, () => {
			let priv = new PrivateRoom(origin.nickname).with_id(origin.id);
			priv.set_pending(false);
			priv.add_participant(
				new PrivateParticipant(this.client()).with_is_current_client(
					true,
				),
			);
			let maybe_user = this.user_manager().find(origin.id);
			maybe_user.then((user) =>
				priv.add_participant(new PrivateParticipant(user)),
			);
			return priv;
		});

		room.marks_as_opened();

		this.room_manager().set_current(room.id());

		// this.emit("QUERY", { nickname: name });
	}

	open_room(target: Origin | RoomID) {
		let room_id: RoomID;
		if (is_string(target)) {
			room_id = target;
		} else {
			room_id = target.id;
		}

		if (!is_channel(room_id)) {
			this.room_manager().set_current(room_id);
			return;
		}

		if (this.room_manager().has(room_id)) {
			let channel = this.room_manager().get(room_id).unwrap();
			assert_channel_room(channel);
			if (!channel.is_closed() && !channel.kicked) {
				return;
			}
		}

		let module = this.module_manager()
			.get("JOIN")
			.expect("Récupération du module `JOIN`");
		module.send({ channels: [room_id] });
	}

	room_manager(): RoomManager {
		return this._room_manager;
	}

	add_channels_list(list: GenericReply<"RPL_LIST">) {
		this._channels_list.push(list);
	}

	set_connect_user_info(connect_user_info: ConnectUserInfo) {
		this._connect_user_info.replace(connect_user_info);
	}

	set_connected(b: boolean) {
		this.network().set_connected(b);
	}

	set_client(origin: Origin) {
		this._client_id_storage.set(origin.id);
		this._client.replace(origin);
	}

	set_network_name(network_name: CustomRoomID) {
		this._network.replace(network_name);
	}

	set_client_id(id: UserID) {
		this.client().id = id;
	}

	set_client_nickname(nickname: string) {
		this.client().nickname = nickname;
	}

	set_selected_user(channel_name: ChannelID, origin: Origin) {
		let channel = this.room_manager().get(channel_name).unwrap();
		assert_channel_room(channel);
		channel.members.select(origin.id);
	}

	toggle_select_channel_member(channel: ChannelRoom, origin: Origin) {
		let maybe_member = this.get_current_selected_channel_member(channel);
		if (maybe_member.is_some()) {
			let selected_member = maybe_member.unwrap();
			if (selected_member.member.eq(origin.id)) {
				this.unset_selected_user(channel.id(), origin);
			} else {
				this.set_selected_user(channel.id(), origin);
			}
		} else {
			this.set_selected_user(channel.id(), origin);
		}
	}

	unignore_user(nickname: string) {
		let module = this.module_manager()
			.get("SILENCE")
			.expect("Récupération du module `SILENCE`");
		module.send({ nickname: `-${nickname}` });
	}

	unset_selected_user(channel_name: ChannelID, origin: Origin) {
		let channel = this.room_manager().get(channel_name).unwrap();
		assert_channel_room(channel);
		channel.members.unselect(origin.id);
	}

	user_manager(): UserManager {
		return this._user_manager;
	}

	websocket(): TypeSafeSocket {
		return this._ws.expect("Instance WebSocket connecté au serveur");
	}
}
