// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Option } from "@phisyx/flex-safety";
import { defineStore } from "pinia";
import { Socket, io } from "socket.io-client";
import { reactive } from "vue";

import { assertChannelRoom } from "~/asserts/room";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelID, ChannelRoom } from "~/channel/ChannelRoom";
import { ChannelSelectedUser } from "~/channel/ChannelSelectedUser";
import { ChannelListCustomRoom } from "~/custom-room/ChannelListCustomRoom";
import { ServerCustomRoom } from "~/custom-room/ServerCustomRoom";

import { CommandInterface, Module } from "~/modules/interface";
import { PrivateNick } from "~/private/PrivateNick";
import { PrivateRoom } from "~/private/PrivateRoom";
import { Room, RoomID } from "~/room/Room";
import { RoomManager } from "~/room/RoomManager";
import { ClientIDStorage } from "~/storage/ClientIDStorage";
import { User, UserID } from "~/user/User";
import { useOverlayerStore } from "./OverlayerStore";

const ReplyCreatedHandler = () => import("~/handlers/replies/ReplyCreatedHandler");
const ReplyYourhostHandler = () => import("~/handlers/replies/ReplyYourhostHandler");
const ReplyWelcomeHandler = () => import("~/handlers/replies/ReplyWelcomeHandler");

const ErrorCannotsendtochanHandler = () => import("~/handlers/errors/ErrorCannotsendtochanHandler");
const ErrorChanoprivsneededHandler = () => import("~/handlers/errors/ErrorChanoprivsneededHandler");
const ErrorGeneralHandler = () => import("~/handlers/errors/ErrorGenericHandler");
const ErrorNicknameinuseHandler = () => import("~/handlers/errors/ErrorNicknameinuseHandler");
const ErrorNoprivilegesHandler = () => import("~/handlers/errors/ErrorNoprivilegesHandler");
const ErrorNosuchchannelHandler = () => import("~/handlers/errors/ErrorNosuchchannelHandler");
const ErrorNosuchnickHandler = () => import("~/handlers/errors/ErrorNosuchnickHandler");
const ErrorNotonchannelHandler = () => import("~/handlers/errors/ErrorNotonchannelHandler");
const ErrorUsernotinchannelHandler = () => import("~/handlers/errors/ErrorUsernotinchannelHandler");

const AwayModule = () => import("~/modules/user-status/module");
const IgnoreModule = () => import("~/modules/(un)ignore/module");
const JoinModule = () => import("~/modules/join/module");
const KickModule = () => import("~/modules/kick/module");
const KillModule = () => import("~/modules/kill/module");
const ListModule = () => import("~/modules/list/module");
const ModeModule = () => import("~/modules/mode/module");
const NickModule = () => import("~/modules/nick/module");
const OperModule = () => import("~/modules/oper/module");
const PartModule = () => import("~/modules/part/module");
const PrivmsgModule = () => import("~/modules/privmsg/module");
const QuitModule = () => import("~/modules/quit/module");
const TopicModule = () => import("~/modules/topic/module");
const AccessLevelModule = () => import("~/modules/mode/access-level/module");

// ---- //
// Type //
// ---- //

type ConnectUserInfo = {
	channels: string;
	alternativeNickname: string;
	nickname: string;
	passwordServer: string | null;
	realname: string;
	websocketServerURL: string;
};

// -------------- //
// Implémentation //
// -------------- //

export class ChatStore {
	// ------ //
	// Static //
	// ------ //

	static readonly NAME = "chat-store";

	static default(): ChatStore {
		const self = reactive(new ChatStore()) as ChatStore;

		self.handlersSets
			.add(ReplyCreatedHandler)
			.add(ReplyYourhostHandler)
			.add(ReplyWelcomeHandler)
			.add(ErrorCannotsendtochanHandler)
			.add(ErrorChanoprivsneededHandler)
			.add(ErrorGeneralHandler)
			.add(ErrorNicknameinuseHandler)
			.add(ErrorNoprivilegesHandler)
			.add(ErrorNosuchchannelHandler)
			.add(ErrorNosuchnickHandler)
			.add(ErrorNotonchannelHandler)
			.add(ErrorUsernotinchannelHandler);

		self.modulesSets
			.add(AwayModule)
			.add(IgnoreModule)
			.add(JoinModule)
			.add(KickModule)
			.add(KillModule)
			.add(ListModule)
			.add(ModeModule)
			.add(NickModule)
			.add(OperModule)
			.add(PartModule)
			.add(PrivmsgModule)
			.add(QuitModule)
			.add(TopicModule)
			.add(AccessLevelModule);

		const thisServer = new ServerCustomRoom();
		const channelList = new ChannelListCustomRoom();
		// @ts-expect-error test
		const rooms: Map<RoomID, Room> = new Map([
			[thisServer.id(), thisServer],
			[channelList.id(), channelList],
		]);

		self.setNetworkName(thisServer.id());
		self.roomManager().extends(rooms);
		self.roomManager().setCurrent(thisServer.id());

		return self;
	}

	// --------- //
	// Propriété //
	// --------- //

	private overlayer = useOverlayerStore();
	private _connectUserInfo: Option<ConnectUserInfo> = None();
	private _client: Option<Origin> = None();
	public clientError: Option<{ id: string; data: unknown }> = None();
	private _clientIDStorage: ClientIDStorage = new ClientIDStorage();
	private _selectedUser: Option<[ChannelID, UserID]> = None();
	private _network: Option<string> = None();
	private _roomManager: RoomManager = new RoomManager();
	private _ws: Option<Socket<ServerToClientEvent, ClientToServerEvent>> = None();
	private _users: Map<string, User> = new Map();
	private _nicksUsers: Map<string, string> = new Map();
	private _usersBlocked: Map<string, User> = new Map();

	private handlersSets: Set<() => Promise<unknown>> = new Set();
	private modulesSets: Set<() => Promise<unknown>> = new Set();

	public handlers: Map<string, SocketEventHandler> = new Map();
	public modules: Map<CommandsNames, Module & CommandInterface> = new Map();

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute un nouvel utilisateur au Store.
	 */
	addUser(user: User): User {
		const fuser = this._users.get(user.id);
		if (fuser) {
			for (const channel of user.channels) {
				fuser.channels.add(channel);
			}
			return fuser;
		}

		this._users.set(user.id, user);
		// biome-ignore lint/style/noNonNullAssertion: Voir le code ci-haut.
		return this._users.get(user.id)!;
	}

	/**
	 * Ajoute un utilisateur à la liste des utilisateurs bloqués.
	 */
	addUserToBlocklist(user: User) {
		this._usersBlocked.set(user.id, user);
	}

	/**
	 * Chambre personnalisé liste des salons.
	 */
	channelList(): ChannelListCustomRoom {
		return this.roomManager()
			.get(ChannelListCustomRoom.ID)
			.unwrap_unchecked() as ChannelListCustomRoom;
	}

	/**
	 * Change le pseudonyme d'un utilisateur.
	 */
	changeUserNickname(oldNickname: string, newNickname: string) {
		const user = this.findUserByNickname(oldNickname).unwrap();
		this._nicksUsers.delete(oldNickname);
		user.nickname = newNickname;
	}

	/**
	 * ID du client actuellement connecté à l'application.
	 */
	clientID() {
		return this.me().id;
	}

	/**
	 * Connexion au serveur de Chat WebSocket.
	 */
	connectWebsocket(websocketServerURL: string) {
		console.info("Connexion au serveur de WebSocket « %s »", websocketServerURL);

		let clientID = this._clientIDStorage.maybe().unwrap_or("") as string | null;

		if (clientID?.length === 0) {
			clientID = null;
		}

		this._ws.replace(io(websocketServerURL, { auth: { client_id: clientID } }));
	}

	/**
	 * Méthode d'émission de données vers le serveur WebSocket.
	 */
	emit<E extends keyof Commands>(eventName: E, ...payload: Parameters<ClientToServerEvent[E]>) {
		this._ws.expect("Instance WebSocket connecté au serveur").emit(eventName, ...payload);
	}

	/**
	 * Déconnexion du client liée à un événement d'erreur.
	 */
	disconnectError(comment: string) {
		this.overlayer.create({
			id: "error-layer",
			centered: true,
			onClose: () => {
				this.clientError = None();
				window.location.reload();
			},
		});

		this.clientError.replace({
			id: "error-layer",
			data: comment,
		});
	}

	/**
	 * Cherche un utilisateur en fonction d'un ID.
	 */
	findUser(userID: string): Option<User> {
		return Option.from(this._users.get(userID));
	}

	/**
	 * Cherche un utilisateur en fonction d'un pseudonyme.
	 */
	findUserByNickname(nickname: string): Option<User> {
		if (this._nicksUsers.has(nickname.toLowerCase())) {
			const userID = this._nicksUsers.get(nickname.toLowerCase()) as string;
			return this.findUser(userID);
		}

		const maybeUser = Option.from(
			Array.from(this._users.values()).find(
				(user) => user.nickname.toLowerCase() === nickname.toLowerCase(),
			),
		);

		maybeUser.then((user) => {
			this._nicksUsers.set(user.nickname.toLowerCase(), user.id);
		});

		return maybeUser;
	}

	/**
	 * Récupère les salons à rejoindre automatiquement.
	 */
	getAutoJoinChannels(): Array<string> {
		return this.getConnectUserInfo().channels.split(",");
	}

	/**
	 * Récupère les informations de connexion de l'utilisateur.
	 */
	getConnectUserInfo(): ConnectUserInfo {
		return this._connectUserInfo.expect("Information de connexion de l'utilisateur");
	}

	/**
	 * Récupère l'utilisateur sélectionné d'un salon.
	 */
	getSelectedUser(room: ChannelRoom): Option<ChannelSelectedUser> {
		return this._selectedUser
			.and_then(([channelID, userID]) => {
				return this.roomManager()
					.get(channelID)
					.filter((channel) => channel.eq(room))
					.filter_map((channel) => {
						assertChannelRoom(channel);
						return channel.getUser(userID);
					});
			})
			.map((cnick) => {
				return new ChannelSelectedUser(cnick, this.isUserBlocked(cnick.intoUser()));
			});
	}

	/**
	 * Vérifie que le client est connecté au serveur.
	 */
	isConnected(): boolean {
		return this.network().isConnected();
	}

	/**
	 * Vérifie qu'un utilisateur est dans la liste des utilisateurs bloqués.
	 */
	isUserBlocked(user: User): boolean {
		return this._usersBlocked.has(user.id);
	}

	/**
	 * Vérifie qu'une origine correspond à l'utilisateur actuellement connecté
	 * à l'application.
	 */
	isMe(origin: Origin | string): boolean {
		if (typeof origin === "string") {
			return (
				this.me().id === origin || this.me().nickname.toLowerCase() === origin.toLowerCase()
			);
		}

		return this.me().id === origin.id;
	}

	/**
	 * Charge tous les modules du Chat.
	 */
	async loadAllModules() {
		let totalLoaded = this.handlersSets.size + this.modulesSets.size;
		let loaded = 0;

		type LayerData = {
			moduleName?: string;
			totalLoaded: number;
			loaded: number;
		};

		this.overlayer.create<LayerData>({
			id: "load-all-modules",
			centered: true,
			destroyable: "manual",
			data: { loaded, totalLoaded },
		});

		totalLoaded = this.handlersSets.size;
		for (const handler of this.handlersSets) {
			const handlerCtors = (await handler()) as Record<
				string,
				{ new (store: ChatStore): SocketEventHandler }
			>;

			const handlers = Object.entries(handlerCtors);
			const handlersSize = handlers.length;
			if (handlersSize > 1) {
				totalLoaded += handlersSize - 1;
			}

			for (const [handlerName, handlerCtor] of handlers) {
				this.handlers.set(handlerName, new handlerCtor(this));

				loaded += 1;

				this.overlayer.updateData<LayerData>("load-all-modules", {
					loaded,
					totalLoaded,
					moduleName: handlerName,
				});
			}
		}

		totalLoaded += this.modulesSets.size;
		for (const module of this.modulesSets) {
			const moduleCtors = (await module()) as Record<
				string,
				{
					new (): Module & CommandInterface;
					create(store: ChatStore): Module & CommandInterface;
					NAME: string;
				}
			>;

			const modules = Object.entries(moduleCtors);
			const modulesSize = modules.length;
			if (modulesSize > 1) {
				totalLoaded += modulesSize - 1;
			}

			for (const [moduleName, moduleCtor] of modules) {
				console.info("Le module « %s » est maintenant en écoute.", moduleName);
				this.modules.set(
					moduleCtor.NAME.toUpperCase() as CommandsNames,
					moduleCtor.create(this),
				);

				loaded += 1;

				this.overlayer.updateData<LayerData>("load-all-modules", {
					loaded,
					totalLoaded,
					moduleName,
				});
			}
		}

		this.overlayer.destroy("load-all-modules");
	}

	/**
	 * L'utilisateur actuellement connecté à l'application.
	 */
	me(): Origin {
		return this._client.expect("Le client courant connecté");
	}

	/**
	 * La chambre personnalisée du serveur.
	 */
	network(): ServerCustomRoom {
		return this.roomManager().get(this.networkName()).unwrap_unchecked() as ServerCustomRoom;
	}

	/**
	 * Le nom du serveur.
	 */
	networkName(): string {
		return this._network.expect("Nom du réseau");
	}

	/**
	 * Le pseudonyme du client actuellement connecté à l'application.
	 */
	nickname(): string {
		return this.me().nickname;
	}

	/**
	 * Désactive un événement.
	 */
	off<K extends keyof ServerToClientEvent>(eventName: K) {
		this._ws.expect("Instance WebSocket connecté au serveur").off(eventName);
	}

	/**
	 * Active/écoute un événement.
	 */
	on<K extends keyof ServerToClientEvent>(eventName: K, listener: ServerToClientEvent[K]) {
		this._ws.expect("Instance WebSocket connecté au serveur").on(
			eventName,
			// @ts-expect-error : listener
			listener,
		);
	}

	/**
	 * Active/écoute un événement une seule et unique fois.
	 */
	once<K extends keyof ServerToClientEvent>(eventName: K, listener: ServerToClientEvent[K]) {
		this._ws.expect("Instance WebSocket connecté au serveur").once(
			eventName,
			// @ts-expect-error : listener
			listener,
		);
	}

	/**
	 * Supprime un utilisateur de la liste des utilisateurs bloqués.
	 */
	removeUserToBlocklist(user: User): boolean {
		return this._usersBlocked.delete(user.id);
	}

	/**
	 * Supprime un salon d'un utilisateur.
	 */
	removeChannelForUser(channelID: ChannelID, userID: UserID) {
		this._users.get(userID)?.channels.delete(channelID);
	}

	/**
	 * Gestion des chambres.
	 */
	roomManager(): RoomManager {
		return this._roomManager;
	}

	/**
	 * Définit les informations de connexion du formulaire d'accès direct au
	 * Chat de l'utilisateur.
	 */
	setConnectUserInfo(connectUserInfo: ConnectUserInfo) {
		this._connectUserInfo.replace(connectUserInfo);
	}

	/**
	 * Définit l'application comme étant connecté au serveur.
	 */
	setConnected(b: boolean) {
		this.network().setConnected(b);
	}

	/**
	 * Définit l'ID du client.
	 */
	setClientID(clientID: string) {
		this._clientIDStorage.set(clientID);
	}

	/**
	 * Définit l'origine du client.
	 */
	setMe(me: Origin) {
		this._client.replace(me);
	}

	/**
	 * Définit le nom du serveur.
	 */
	setNetworkName(networkName: string) {
		this._network.replace(networkName);
	}

	/**
	 * Définit le nom du client connecté au serveur.
	 */
	setNickname(nickname: string) {
		this.me().nickname = nickname;
	}

	/**
	 * Définit l'utilisateur sélectionné d'un salon.
	 */
	setSelectedUser(room: ChannelRoom, origin: Origin) {
		this._selectedUser.replace([room.id(), origin.id]);
	}

	/**
	 * Met à jour l'utilisateur de la liste des utilisateurs du client.
	 */
	upgradeUser(user: User): User {
		const fuser = this._users.get(user.id);
		if (fuser) {
			fuser.host = user.host;
			fuser.operator = user.operator;
			return fuser;
		}

		this._users.set(user.id, user);
		// biome-ignore lint/style/noNonNullAssertion: Voir le code ci-haut.
		return this._users.get(user.id)!;
	}

	/**
	 * Désélectionne un utilisateur d'un salon.
	 */
	unsetSelectedUser() {
		this._selectedUser = None();
	}

	/**
	 * Instance de la WebSocket.
	 */
	websocket(): Socket<ServerToClientEvent, ClientToServerEvent> {
		return this._ws.expect("Instance WebSocket connecté au serveur");
	}
}

export const useChatStore = defineStore(ChatStore.NAME, () => {
	const store = ChatStore.default();

	/**
	 * Change de chambre.
	 */
	function changeRoom(target: Origin | string) {
		let roomID: string;

		if (typeof target === "string") {
			roomID = target;
		} else {
			roomID = target.id;
		}

		if (!store.roomManager().has(roomID)) {
			return;
		}

		store.roomManager().setCurrent(roomID);

		const current = store.roomManager().current();

		current.unsetTotalUnreadEvents();
		current.unsetTotalUnreadMessages();
	}

	/**
	 * Émet la commande /LIST vers le serveur.
	 */
	function channelList(channels?: Array<string>) {
		changeRoom(ChannelListCustomRoom.ID);
		const moduleUnsafe: CommandInterface<"LIST"> | undefined = store.modules.get("LIST");
		const maybeModule = Option.from(moduleUnsafe);
		const module = maybeModule.expect("Récupération du module `LIST`");
		module?.send({ channels });
	}

	/**
	 * Vérifie qu'un utilisateur est bloqué.
	 */
	function checkUserIsBlocked(user: User): boolean {
		return store.isUserBlocked(user);
	}

	/**
	 * Ferme une chambre. Dans le cas d'un salon, cette fonction émet la
	 * commande /PART vers le serveur.
	 */
	function closeRoom(target: Origin | string, message?: string) {
		let roomID: string;
		if (typeof target === "string") {
			roomID = target;
		} else {
			roomID = target.id;
		}

		if (roomID.startsWith("#")) {
			const moduleUnsafe: CommandInterface<"PART"> | undefined = store.modules.get("PART");
			const maybeModule = Option.from(moduleUnsafe);
			const module = maybeModule.expect("Récupération du module `PART`");
			module.send({ channels: [roomID], message });
		} else {
			store.roomManager().remove(roomID);
		}
	}

	/**
	 * Se connecte au serveur de Chat.
	 */
	function connect(connectUserInfo: ConnectUserInfo) {
		store.setConnectUserInfo(connectUserInfo);
		store.connectWebsocket(connectUserInfo.websocketServerURL);

		store.websocket().once("connect", () => {
			for (const [_, handler] of store.handlers) {
				handler.listen();
			}
			for (const [_, module] of store.modules) {
				module.listen();
			}

			if (connectUserInfo.passwordServer) {
				store.emit("PASS", {
					password: connectUserInfo.passwordServer,
				});
			}
			store.emit("NICK (unregistered)", {
				nickname: connectUserInfo.nickname,
			});
			store.emit("USER", {
				user: connectUserInfo.nickname,
				mode: 1 << 3,
				realname: connectUserInfo.realname,
			});
		});
	}

	/**
	 * @see ChatStore#getSelectedUser
	 */
	function getSelectedUser(room: ChannelRoom): Option<ChannelSelectedUser> {
		return store.getSelectedUser(room);
	}

	/**
	 * Émet la commande /IGNORE vers le serveur.
	 */
	function ignoreUser(nickname: string) {
		const moduleUnsafe: CommandInterface<"IGNORE"> | undefined = store.modules.get("IGNORE");
		const maybeModule = Option.from(moduleUnsafe);
		const module = maybeModule.expect("Récupération du module `IGNORE`");
		module.send({ nickname });
	}

	/**
	 * Émet la commande /JOIN vers le serveur.
	 */
	function joinChannel(channelsRaw: string, keysRaw?: string) {
		const moduleUnsafe: CommandInterface<"JOIN"> | undefined = store.modules.get("JOIN");
		const maybeModule = Option.from(moduleUnsafe);
		const module = maybeModule.expect("Récupération du module `JOIN`");
		const channels = channelsRaw.split(",");
		const keys = keysRaw?.split(",");
		module.send({ channels, keys });
	}

	/**
	 * Émet la commande /KICK vers le serveur.
	 */
	function kickUser(channel: ChannelRoom, cnick: ChannelNick, comment = "Kick.") {
		const moduleUnsafe: CommandInterface<"KICK"> | undefined = store.modules.get("KICK");
		const maybeModule = Option.from(moduleUnsafe);
		const module = maybeModule.expect("Récupération du module `KICK`");
		module.send({
			channels: [channel.name],
			knicks: [cnick.nickname],
			comment,
		});
	}

	/**
	 * Écoute un événement donnée.
	 */
	function listen<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
		options: { once: boolean } = { once: false },
	) {
		if (options.once) {
			store.once(eventName, listener);
		} else {
			store.on(eventName, listener);
		}
	}

	/**
	 * Ouvre un privé ou le crée.
	 */
	function openPrivateOrCreate(origin: Origin) {
		const room = store.roomManager().getOrInsert(origin.id, () => {
			const priv = new PrivateRoom(origin.nickname).withID(origin.id);
			priv.addParticipant(new PrivateNick(new User(store.me())).withIsMe(true));
			const maybeUser = store.findUser(origin.id);
			maybeUser.then((user) => priv.addParticipant(new PrivateNick(user)));
			return priv;
		});

		room.unsetTotalUnreadEvents();
		room.unsetTotalUnreadMessages();

		store.roomManager().setCurrent(room.id());

		// store.emit("QUERY", { nickname: name });
	}

	/**
	 * (Dé-)sélectionne un utilisateur d'un salon.
	 */
	function toggleSelectUser(room: ChannelRoom, origin: Origin) {
		const maybeSelectedUser = store.getSelectedUser(room);
		if (maybeSelectedUser.is_some()) {
			const selectedUser = maybeSelectedUser.unwrap();
			if (selectedUser.cnick.id === origin.id) {
				store.unsetSelectedUser();
			} else {
				store.setSelectedUser(room, origin);
			}
		} else {
			store.setSelectedUser(room, origin);
		}
	}

	/**
	 * Émet les commandes au serveur.
	 */
	function sendMessage(name: string, message: string) {
		const room = store.roomManager().get(name).unwrap_unchecked();
		room.addInputHistory(message);

		if (!message.startsWith("/")) {
			const words = message.split(" ");
			const privmsgModule = store.modules.get("PRIVMSG");
			privmsgModule?.input(name, ...words);
			return;
		}

		const words = message.slice(1).split(" ");
		const [commandName, ...args] = words;

		const module = store.modules.get(commandName.toLowerCase() as CommandsNames);

		if (!module) {
			console.error(
				"[%s]: le module « %s » n'a pas été trouvé.",
				ChatStore.NAME,
				commandName,
			);
			return;
		}

		module.input(...args);
	}

	/**
	 * Émet les commandes liées aux niveaux d'accès vers le serveur.
	 */
	function sendSetAccessLevel(
		channel: ChannelRoom,
		cnick: ChannelNick,
		accessLevel: ChannelAccessLevel,
	) {
		const payload = { channel: channel.name, nicknames: [cnick.nickname] };

		let moduleUnsafe: CommandInterface<"OP"> | undefined;

		switch (accessLevel) {
			case ChannelAccessLevel.Owner:
				moduleUnsafe = store.modules.get("QOP");
				break;
			case ChannelAccessLevel.AdminOperator:
				moduleUnsafe = store.modules.get("AOP");
				break;
			case ChannelAccessLevel.Operator:
				moduleUnsafe = store.modules.get("OP");
				break;
			case ChannelAccessLevel.HalfOperator:
				moduleUnsafe = store.modules.get("HOP");
				break;
			case ChannelAccessLevel.Vip:
				moduleUnsafe = store.modules.get("VIP");
				break;
		}

		const maybeModule = Option.from(moduleUnsafe);
		const module = maybeModule.expect(
			`Récupération du module \`AccessLevel (${accessLevel})\``,
		);

		module.send(payload);
	}

	/**
	 * Émet les commandes liées aux niveaux d'accès vers le serveur.
	 */
	function sendUnsetAccessLevel(
		channel: ChannelRoom,
		cnick: ChannelNick,
		accessLevel: ChannelAccessLevel,
	) {
		const payload = { channel: channel.name, nicknames: [cnick.nickname] };

		let moduleUnsafe: CommandInterface<"OP"> | undefined;

		switch (accessLevel) {
			case ChannelAccessLevel.Owner:
				moduleUnsafe = store.modules.get("DEQOP");
				break;
			case ChannelAccessLevel.AdminOperator:
				moduleUnsafe = store.modules.get("AOP");
				break;
			case ChannelAccessLevel.Operator:
				moduleUnsafe = store.modules.get("DEOP");
				break;
			case ChannelAccessLevel.HalfOperator:
				moduleUnsafe = store.modules.get("DEHOP");
				break;
			case ChannelAccessLevel.Vip:
				moduleUnsafe = store.modules.get("DEVIP");
				break;
		}

		const maybeModule = Option.from(moduleUnsafe);
		const module = maybeModule.expect(
			`Récupération du module \`AccessLevel (${accessLevel})\``,
		);

		module?.send(payload);
	}

	/**
	 * Émet la commande /UNIGNORE vers le serveur.
	 */
	function unignoreUser(nickname: string) {
		const moduleUnsafe: CommandInterface<"UNIGNORE"> | undefined =
			store.modules.get("UNIGNORE");
		const maybeModule = Option.from(moduleUnsafe);
		const module = maybeModule.expect("Récupération du module `UNIGNORE`");
		module.send({ nickname });
	}

	/**
	 * Émet la commande /TOPIC vers le serveur.
	 */
	function updateTopic(channelName: string, topic: string) {
		const moduleUnsafe: CommandInterface<"TOPIC"> | undefined = store.modules.get("TOPIC");
		const maybeModule = Option.from(moduleUnsafe);
		const module = maybeModule.expect("Récupération du module `TOPIC`");
		module.send({ channel: channelName, topic });
	}

	return {
		store,

		changeRoom,
		channelList,
		checkUserIsBlocked,
		closeRoom,
		connect,
		getSelectedUser,
		ignoreUser,
		joinChannel,
		kickUser,
		listen,
		openPrivateOrCreate,
		sendMessage,
		sendSetAccessLevel,
		sendUnsetAccessLevel,
		toggleSelectUser,
		unignoreUser,
		updateTopic,
	};
});
