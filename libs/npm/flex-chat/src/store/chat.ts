// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, type Option } from "@phisyx/flex-safety";

import { assertChannelRoom } from "../asserts/room";
import { ChannelMemberSelected } from "../channel/member/selected";
import type { ChannelRoom } from "../channel/room";
import { ChannelListCustomRoom } from "../custom_room/channel_list";
import { ServerCustomRoom } from "../custom_room/server";
import { HandlerManager } from "../handlers/manager";
import { ClientIDStorage } from "../localstorage/client_id";
import { ModuleManager } from "../modules/manager";
import { RoomManager } from "../room/manager";
import { UserManager } from "../user/manager";
import type { OverlayerStore } from "./overlayer";

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

export type ConnectUserInfo = {
	channels: ChannelID;
	alternativeNickname: string;
	nickname: string;
	passwordServer: string | null;
	realname: string;
	websocketServerURL: string;
};

export interface ChatStoreInterface {
	clientError: Option<{
		id: string;
		title?: string;
		subtitle?: string;
		problems?: HttpProblemErrorResponse["errors"];
		data: unknown;
	}>;

	/**
	 * Chambre personnalisé liste des salons.
	 */
	channelList(): ChannelListCustomRoom;

	/**
	 * ID du client actuellement connecté à l'application.
	 */
	clientID(): UserID;

	/**
	 * L'utilisateur actuellement connecté à l'application.
	 */
	client(): Origin;

	/**
	 * Méthode d'émission de données vers le serveur WebSocket.
	 */
	emit<E extends keyof Commands>(
		eventName: E,
		...payload: Parameters<ClientToServerEvent[E]>
	): void;

	/**
	 * Récupère les salons à rejoindre automatiquement.
	 */
	getAutoJoinChannels(): Array<ChannelID>;

	/**
	 * Récupère les informations de connexion de l'utilisateur.
	 */
	getConnectUserInfo(): ConnectUserInfo;

	/**
	 * Récupère l'utilisateur sélectionné d'un salon.
	 */
	getCurrentSelectedChannelMember(
		room: ChannelRoom,
	): Option<ChannelMemberSelected>;

	/**
	 * Vérifie que le client est connecté au serveur.
	 */
	isConnected(): boolean;

	/**
	 * Vérifie qu'une origine correspond à l'utilisateur actuellement connecté
	 * à l'application.
	 */
	isCurrentClient(origin: Origin | string): boolean;

	/**
	 * Gestion des handlers.
	 */
	handlerManager(): HandlerManager;

	/**
	 * Gestion des modules.
	 */
	moduleManager(): ModuleManager;

	/**
	 * La chambre personnalisée du serveur.
	 */
	network(): ServerCustomRoom;

	/**
	 * Le nom du serveur.
	 */
	networkName(): CustomRoomID;

	/**
	 * Le pseudonyme du client actuellement connecté à l'application.
	 */
	nickname(): string;

	/**
	 * Désactive un événement.
	 */
	off<K extends keyof ServerToClientEvent>(eventName: K): void;

	/**
	 * Active/écoute un événement.
	 */
	on<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	): void;

	/**
	 * Active/écoute un événement une seule et unique fois.
	 */
	once<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	): void;

	/**
	 * Gestion des chambres.
	 */
	roomManager(): RoomManager;

	/**
	 * Définit les informations de connexion du formulaire d'accès direct au
	 * Chat de l'utilisateur.
	 */
	setConnectUserInfo(connectUserInfo: ConnectUserInfo): void;

	/**
	 * Définit l'application comme étant connecté au serveur.
	 */
	setConnected(b: boolean): void;

	/**
	 * Définit l'origine du client.
	 */
	setClient(origin: Origin): void;

	/**
	 * Définit l'ID de l'utilisateur.
	 */
	setUserID(userID: UUID): void;

	/**
	 * Définit le nom du serveur.
	 */
	setNetworkName(networkName: CustomRoomID): void;

	/**
	 * Définit un nouvel ID au client connecté au serveur.
	 */
	setClientID(id: UserID): void;

	/**
	 * Définit le nom du client connecté au serveur.
	 */
	setClientNickname(nickname: string): void;

	/**
	 * Définit l'utilisateur sélectionné d'un salon.
	 */
	setSelectedUser(room: ChannelRoom, origin: Origin): void;

	/**
	 * Désélectionne un utilisateur d'un salon.
	 */
	unsetSelectedUser(room: ChannelRoom, origin: Origin): void;

	/**
	 * Gestion des utilisateurs.
	 */
	userManager(): UserManager;

	/**
	 * Instance de la WebSocket.
	 */
	websocket(): TypeSafeSocket;
}

export interface ChatStoreInterfaceExt {
	/**
	 * Connexion au serveur de Chat WebSocket.
	 */
	connectWebsocket(websocketServerURL: string): void;

	/**
	 * Déconnexion du client liée à un événement d'erreur.
	 */
	disconnectError(comment: GenericReply<"ERROR"> | string): void;

	/**
	 * Charge tous les modules du Chat.
	 */
	loadAllModules(): Promise<void>;

	overlayer(): OverlayerStore;
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

	private _connectUserInfo: Option<ConnectUserInfo> = None();
	private _client: Option<Origin> = None();
	public clientError: Option<{
		id: string;
		title?: string;
		subtitle?: string;
		problems?: HttpProblemErrorResponse["errors"];
		data: unknown;
	}> = None();
	protected _clientIDStorage: ClientIDStorage = new ClientIDStorage();
	protected _userID: Option<UUID> = None();
	private _network: Option<CustomRoomID> = None();
	private _roomManager: RoomManager = new RoomManager();
	protected _ws: Option<TypeSafeSocket> = None();
	private _userManager: UserManager = new UserManager();

	protected _handlerManager = new HandlerManager();
	protected _moduleManager = new ModuleManager();

	constructor() {
		this._handlerManager
			.extends(HANDLERS)
			.extends(MODULES_REPLIES_HANDLERS);
		this._moduleManager.extends(MODULES);

		const thisServer = new ServerCustomRoom();
		const channelList = new ChannelListCustomRoom();

		this.setNetworkName(thisServer.id());
		this.roomManager().extends([
			[thisServer.id(), thisServer],
			[channelList.id(), channelList],
		]);
		this.roomManager().setCurrent(thisServer.id());
	}

	// ------- //
	// Méthode // -> Interface
	// ------- //

	channelList(): ChannelListCustomRoom {
		return this.roomManager()
			.get(ChannelListCustomRoom.ID)
			.unwrap_unchecked() as ChannelListCustomRoom;
	}

	clientID(): UserID {
		return this.client().id;
	}

	client(): Origin {
		return this._client.expect("Le client courant connecté");
	}

	emit<E extends keyof Commands>(
		eventName: E,
		...payload: Parameters<ClientToServerEvent[E]>
	): void {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.emit(eventName, ...payload);
	}

	getAutoJoinChannels(): Array<ChannelID> {
		const channels: ChannelID = this.getConnectUserInfo().channels;
		return channels.split(",") as Array<ChannelID>;
	}

	getConnectUserInfo(): ConnectUserInfo {
		return this._connectUserInfo.expect(
			"Information de connexion de l'utilisateur",
		);
	}

	getCurrentSelectedChannelMember(
		room: ChannelRoom,
	): Option<ChannelMemberSelected> {
		return this.roomManager()
			.get(room.id())
			.and_then((room) => {
				assertChannelRoom(room);
				return room.members.selected();
			})
			.map((member) => {
				const channelMemberSelected = new ChannelMemberSelected(
					member,
					this.userManager().isBlocked(member.id),
				).withBanned(room.findBan(member));
				return channelMemberSelected;
			});
	}

	isConnected(): boolean {
		return this.network().isConnected();
	}

	isCurrentClient(origin: Origin | string): boolean {
		if (typeof origin === "string") {
			return (
				this.client().id === origin ||
				this.client().nickname.toLowerCase() === origin.toLowerCase()
			);
		}

		return this.client().id === origin.id;
	}

	handlerManager(): HandlerManager {
		return this._handlerManager;
	}

	moduleManager(): ModuleManager {
		return this._moduleManager;
	}

	network(): ServerCustomRoom {
		return this.roomManager()
			.get(this.networkName())
			.unwrap_unchecked() as ServerCustomRoom;
	}

	networkName(): CustomRoomID {
		return this._network.expect("Nom du réseau");
	}

	nickname(): string {
		return this.client().nickname;
	}

	off<K extends keyof ServerToClientEvent>(eventName: K): void {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.off(eventName);
	}

	on<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	): void {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.on(eventName, listener);
	}

	once<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	): void {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.once(eventName, listener);
	}

	roomManager(): RoomManager {
		return this._roomManager;
	}

	setConnectUserInfo(connectUserInfo: ConnectUserInfo): void {
		this._connectUserInfo.replace(connectUserInfo);
	}

	setConnected(b: boolean): void {
		this.network().setConnected(b);
	}

	setClient(origin: Origin): void {
		this._clientIDStorage.set(origin.id);
		this._client.replace(origin);
	}

	setUserID(userID: UUID): void {
		this._userID.replace(userID);
	}

	setNetworkName(networkName: CustomRoomID): void {
		this._network.replace(networkName);
	}

	setClientID(id: UserID): void {
		this.client().id = id;
	}

	setClientNickname(nickname: string): void {
		this.client().nickname = nickname;
	}

	setSelectedUser(room: ChannelRoom, origin: Origin): void {
		room.members.select(origin.id);
	}

	unsetSelectedUser(room: ChannelRoom, origin: Origin): void {
		room.members.unselect(origin.id);
	}

	userManager(): UserManager {
		return this._userManager;
	}

	websocket(): TypeSafeSocket {
		return this._ws.expect("Instance WebSocket connecté au serveur");
	}
}
