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
import { ErrorBadchannelkeyHandler } from "~/handlers/errors/ErrorBadchannelkeyHandler";
import { ErrorCannotsendtochanHandler } from "~/handlers/errors/ErrorCannotsendtochanHandler";
import { ErrorChanoprivsneededHandler } from "~/handlers/errors/ErrorChanoprivsneededHandler";
import { ErrorGeneralHandler } from "~/handlers/errors/ErrorGenericHandler";
import { ErrorNicknameinuseHandler } from "~/handlers/errors/ErrorNicknameinuseHandler";
import { ErrorNoprivilegesHandler } from "~/handlers/errors/ErrorNoprivilegesHandler";
import { ErrorNosuchchannelHandler } from "~/handlers/errors/ErrorNosuchchannelHandler";
import { ErrorNosuchnickHandler } from "~/handlers/errors/ErrorNosuchnickHandler";
import { ErrorNotonchannelHandler } from "~/handlers/errors/ErrorNotonchannelHandler";
import { ErrorUsernotinchannelHandler } from "~/handlers/errors/ErrorUsernotinchannelHandler";
import { ReplyCreatedHandler } from "~/handlers/replies/ReplyCreatedHandler";
import { ReplyWelcomeHandler } from "~/handlers/replies/ReplyWelcomeHandler";
import { ReplyYourhostHandler } from "~/handlers/replies/ReplyYourhostHandler";
import { IgnoreModule, UnignoreModule } from "~/modules/(un)ignore/module";
import { CommandInterface, Module } from "~/modules/interface";
import { JoinModule, SajoinModule } from "~/modules/join/module";
import { KickModule } from "~/modules/kick/module";
import { KillModule } from "~/modules/kill/module";
import { ListModule } from "~/modules/list/module";
import {
	AccessLevelAOPModule,
	AccessLevelDEAOPModule,
	AccessLevelDEHOPModule,
	AccessLevelDEOPModule,
	AccessLevelDEQOPModule,
	AccessLevelDEVIPModule,
	AccessLevelHOPModule,
	AccessLevelOPModule,
	AccessLevelQOPModule,
	AccessLevelVIPModule,
} from "~/modules/mode/access-level/module";
import { ModeModule } from "~/modules/mode/module";
import { NickModule } from "~/modules/nick/module";
import { OperModule } from "~/modules/oper/module";
import { PartModule, SapartModule } from "~/modules/part/module";
import { PrivmsgModule } from "~/modules/privmsg/module";
import { QuitModule } from "~/modules/quit/module";
import { TopicModule } from "~/modules/topic/module";
import { AwayModule } from "~/modules/user-status/module";
import { PrivateNick } from "~/private/PrivateNick";
import { PrivateRoom } from "~/private/PrivateRoom";
import { Room, RoomID } from "~/room/Room";
import { RoomManager } from "~/room/RoomManager";
import { ClientIDStorage } from "~/storage/ClientIDStorage";
import { User, UserID } from "~/user/User";
import { useOverlayerStore } from "./OverlayerStore";

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

		self.repliesHandlers
			.add(new ReplyWelcomeHandler(self))
			.add(new ReplyCreatedHandler(self))
			.add(new ReplyYourhostHandler(self));

		self.errorsHandlers
			.add(new ErrorGeneralHandler(self))
			.add(new ErrorBadchannelkeyHandler(self))
			.add(new ErrorChanoprivsneededHandler(self))
			.add(new ErrorCannotsendtochanHandler(self))
			.add(new ErrorNicknameinuseHandler(self))
			.add(new ErrorNoprivilegesHandler(self))
			.add(new ErrorNosuchchannelHandler(self))
			.add(new ErrorNosuchnickHandler(self))
			.add(new ErrorNotonchannelHandler(self))
			.add(new ErrorUsernotinchannelHandler(self));

		self.modules.set(AwayModule.NAME, AwayModule.create(self));
		self.modules
			.set(IgnoreModule.NAME, IgnoreModule.create(self))
			.set(UnignoreModule.NAME, UnignoreModule.create(self));
		self.modules
			.set(JoinModule.NAME, JoinModule.create(self))
			.set(SajoinModule.NAME, SajoinModule.create(self));
		self.modules.set(KickModule.NAME, KickModule.create(self));
		self.modules.set(KillModule.NAME, KillModule.create(self));
		self.modules.set(ListModule.NAME, ListModule.create(self));
		self.modules.set(ModeModule.NAME, ModeModule.create(self));
		self.modules.set(NickModule.NAME, NickModule.create(self));
		self.modules
			.set(PartModule.NAME, PartModule.create(self))
			.set(SapartModule.NAME, SapartModule.create(self));
		self.modules.set(PrivmsgModule.NAME, PrivmsgModule.create(self));
		self.modules.set(OperModule.NAME, OperModule.create(self));
		self.modules.set(QuitModule.NAME, QuitModule.create(self));
		self.modules.set(TopicModule.NAME, TopicModule.create(self));

		/** Channel access level */
		self.modules
			.set(AccessLevelQOPModule.NAME, AccessLevelQOPModule.create(self))
			.set(AccessLevelDEQOPModule.NAME, AccessLevelDEQOPModule.create(self));
		self.modules
			.set(AccessLevelAOPModule.NAME, AccessLevelAOPModule.create(self))
			.set(AccessLevelDEAOPModule.NAME, AccessLevelDEAOPModule.create(self));
		self.modules
			.set(AccessLevelOPModule.NAME, AccessLevelOPModule.create(self))
			.set(AccessLevelDEOPModule.NAME, AccessLevelDEOPModule.create(self));
		self.modules
			.set(AccessLevelHOPModule.NAME, AccessLevelHOPModule.create(self))
			.set(AccessLevelDEHOPModule.NAME, AccessLevelDEHOPModule.create(self));
		self.modules
			.set(AccessLevelVIPModule.NAME, AccessLevelVIPModule.create(self))
			.set(AccessLevelDEVIPModule.NAME, AccessLevelDEVIPModule.create(self));

		const thisServer = new ServerCustomRoom("Flex");
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

	private repliesHandlers: Set<SocketEventHandler> = new Set();
	private errorsHandlers: Set<SocketEventHandler> = new Set();

	public modules: Map<string, Module> = new Map();

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
	 * Écoute de tous les événements du Chat.
	 */
	listenAllEvents() {
		for (const handler of this.repliesHandlers) {
			handler.listen();
		}

		for (const handler of this.errorsHandlers) {
			handler.listen();
		}

		for (const [moduleName, module] of this.modules) {
			console.info("Le module « %s » est maintenant en écoute.", moduleName);
			module.listen();
		}
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
		const listModule = store.modules.get(ListModule.NAME) as ListModule;
		listModule.send({ channels });
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
			const partModuleUnsafe = store.modules.get(PartModule.NAME);
			const maybePartModule = Option.from(partModuleUnsafe);
			const partModule = maybePartModule.expect(
				"Récupération du module `PART`",
			) as Module<PartModule>;
			partModule.send({ channels: [roomID], message });
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

		store.listenAllEvents();
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
		const ignoreModule = store.modules.get(IgnoreModule.NAME) as IgnoreModule;
		ignoreModule.send({ nickname });
	}

	/**
	 * Émet la commande /JOIN vers le serveur.
	 */
	function joinChannel(name: string) {
		const joinModule = store.modules.get(JoinModule.NAME) as JoinModule;
		joinModule.send({ channels: [name] });
	}

	/**
	 * Émet la commande /KICK vers le serveur.
	 */
	function kickUser(channel: ChannelRoom, cnick: ChannelNick, comment = "Kick.") {
		const ignoreModule = store.modules.get(KickModule.NAME) as KickModule;
		ignoreModule.send({
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
		if (!message.startsWith("/")) {
			const words = message.split(" ");
			const privmsgModule = store.modules.get(PrivmsgModule.NAME) as PrivmsgModule;

			privmsgModule.input(name, ...words);
			return;
		}

		const words = message.slice(1).split(" ");
		const [commandName, ...args] = words;

		const module = store.modules.get(commandName.toUpperCase());

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

		let module: unknown;

		switch (accessLevel) {
			case ChannelAccessLevel.Owner:
				module = store.modules.get(AccessLevelQOPModule.NAME);
				break;
			case ChannelAccessLevel.AdminOperator:
				module = store.modules.get(AccessLevelAOPModule.NAME);
				break;
			case ChannelAccessLevel.Operator:
				module = store.modules.get(AccessLevelOPModule.NAME);
				break;
			case ChannelAccessLevel.HalfOperator:
				module = store.modules.get(AccessLevelHOPModule.NAME);
				break;
			case ChannelAccessLevel.Vip:
				module = store.modules.get(AccessLevelVIPModule.NAME);
				break;
		}

		(module as CommandInterface<"OP">).send(payload);
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
		let module: unknown;

		switch (accessLevel) {
			case ChannelAccessLevel.Owner:
				module = store.modules.get(AccessLevelDEQOPModule.NAME);
				break;
			case ChannelAccessLevel.AdminOperator:
				module = store.modules.get(AccessLevelDEAOPModule.NAME);
				break;
			case ChannelAccessLevel.Operator:
				module = store.modules.get(AccessLevelDEOPModule.NAME);
				break;
			case ChannelAccessLevel.HalfOperator:
				module = store.modules.get(AccessLevelDEHOPModule.NAME);
				break;
			case ChannelAccessLevel.Vip:
				module = store.modules.get(AccessLevelDEVIPModule.NAME);
				break;
		}

		(module as CommandInterface<"DEOP">).send(payload);
	}

	/**
	 * Émet la commande /UNIGNORE vers le serveur.
	 */
	function unignoreUser(nickname: string) {
		const unignoreModule = store.modules.get(UnignoreModule.NAME) as UnignoreModule;
		unignoreModule.send({ nickname });
	}

	/**
	 * Émet la commande /TOPIC vers le serveur.
	 */
	function updateTopic(channelName: string, topic: string) {
		const topicModule = store.modules.get(TopicModule.NAME) as TopicModule;
		topicModule.send({ channel: channelName, topic });
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
