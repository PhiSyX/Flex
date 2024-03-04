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

import { assertChannelRoom, isChannel } from "~/asserts/room";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";
import { ChannelRoom } from "~/channel/ChannelRoom";
import { ChannelListCustomRoom } from "~/custom-room/ChannelListCustomRoom";
import { ServerCustomRoom } from "~/custom-room/ServerCustomRoom";

import { HandlerManager } from "~/handlers/manager";
import { CommandInterface, Module } from "~/modules/interface";
import { ModuleManager } from "~/modules/manager";
import { PrivateParticipant } from "~/private/PrivateParticipant";
import { PrivateRoom } from "~/private/PrivateRoom";
import { RoomManager } from "~/room/RoomManager";
import { ClientIDStorage } from "~/store/local-storage/ClientIDStorage";
import { User } from "~/user/User";
import { UserManager } from "~/user/UserManager";
import { useOverlayerStore } from "./OverlayerStore";

const HANDLERS = import.meta.glob("~/handlers/*/*.ts");
const MODULES = import.meta.glob("~/modules/**/module.ts");
const MODULES_REPLIES_HANDLERS = import.meta.glob("~/modules/**/replies.ts");

// ---- //
// Type //
// ---- //

type ConnectUserInfo = {
	channels: ChannelID;
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

		self._handlerManager.extends(HANDLERS).extends(MODULES_REPLIES_HANDLERS);
		self._moduleManager.extends(MODULES);

		const thisServer = new ServerCustomRoom();
		const channelList = new ChannelListCustomRoom();

		self.setNetworkName(thisServer.id());
		self.roomManager().extends([
			[thisServer.id(), thisServer],
			[channelList.id(), channelList],
		]);
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
	private _network: Option<CustomRoomID> = None();
	private _roomManager: RoomManager = new RoomManager();
	private _ws: Option<Socket<ServerToClientEvent, ClientToServerEvent>> = None();
	private _userManager: UserManager = new UserManager();

	private _handlerManager = new HandlerManager();
	private _moduleManager = new ModuleManager();

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Chambre personnalisé liste des salons.
	 */
	channelList(): ChannelListCustomRoom {
		return this.roomManager()
			.get(ChannelListCustomRoom.ID)
			.unwrap_unchecked() as ChannelListCustomRoom;
	}

	/**
	 * ID du client actuellement connecté à l'application.
	 */
	clientID() {
		return this.client().id;
	}

	/**
	 * L'utilisateur actuellement connecté à l'application.
	 */
	client(): Origin {
		return this._client.expect("Le client courant connecté");
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

		this._ws.replace(
			io(websocketServerURL, {
				auth: { client_id: clientID },
				transports: ["websocket"],
				reconnection: true,
				reconnectionDelay: 10_000,
				rememberUpgrade: true,
				withCredentials: true,
			}),
		);
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
	 * Récupère les salons à rejoindre automatiquement.
	 */
	getAutoJoinChannels(): Array<ChannelID> {
		const channels: ChannelID = this.getConnectUserInfo().channels;
		return channels.split(",") as Array<ChannelID>;
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
	getCurrentSelectedChannelMember(room: ChannelRoom): Option<ChannelMemberSelected> {
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

	/**
	 * Vérifie que le client est connecté au serveur.
	 */
	isConnected(): boolean {
		return this.network().isConnected();
	}

	/**
	 * Vérifie qu'une origine correspond à l'utilisateur actuellement connecté
	 * à l'application.
	 */
	isCurrentClient(origin: Origin | string): boolean {
		if (typeof origin === "string") {
			return (
				this.client().id === origin ||
				this.client().nickname.toLowerCase() === origin.toLowerCase()
			);
		}

		return this.client().id === origin.id;
	}

	/**
	 * Charge tous les modules du Chat.
	 */
	async loadAllModules() {
		let totalLoaded = this._handlerManager.size + this._moduleManager.size;
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

		totalLoaded = this._handlerManager.size;

		for (const handler of this._handlerManager.sets()) {
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
				this._handlerManager.set(handlerName, new handlerCtor(this));

				loaded += 1;

				this.overlayer.updateData<LayerData>("load-all-modules", {
					loaded,
					totalLoaded,
					moduleName: handlerName,
				});
			}
		}

		totalLoaded += this._moduleManager.size;
		for (const module of this.moduleManager().sets()) {
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
				this.moduleManager().set(moduleCtor.NAME.toUpperCase(), moduleCtor.create(this));

				loaded += 1;

				this.overlayer.updateData<LayerData>("load-all-modules", {
					loaded,
					totalLoaded,
					moduleName,
				});
			}
		}

		this._handlerManager.free();
		this._moduleManager.free();
		this.overlayer.destroy("load-all-modules");
	}

	/**
	 * Gestion des handlers.
	 */
	handlerManager(): HandlerManager {
		return this._handlerManager;
	}

	/**
	 * Gestion des modules.
	 */
	moduleManager(): ModuleManager {
		return this._moduleManager;
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
	networkName(): CustomRoomID {
		return this._network.expect("Nom du réseau");
	}

	/**
	 * Le pseudonyme du client actuellement connecté à l'application.
	 */
	nickname(): string {
		return this.client().nickname;
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
	 * Définit l'origine du client.
	 */
	setClient(origin: Origin) {
		this._clientIDStorage.set(origin.id);
		this._client.replace(origin);
	}

	/**
	 * Définit le nom du serveur.
	 */
	setNetworkName(networkName: CustomRoomID) {
		this._network.replace(networkName);
	}

	/**
	 * Définit le nom du client connecté au serveur.
	 */
	setClientNickname(nickname: string) {
		this.client().nickname = nickname;
	}

	/**
	 * Définit l'utilisateur sélectionné d'un salon.
	 */
	setSelectedUser(room: ChannelRoom, origin: Origin) {
		room.members.select(origin.id);
	}

	/**
	 * Désélectionne un utilisateur d'un salon.
	 */
	unsetSelectedUser(room: ChannelRoom, origin: Origin) {
		room.members.unselect(origin.id);
	}

	/**
	 * Gestion des utilisateurs.
	 */
	userManager(): UserManager {
		return this._userManager;
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
	 * Toutes les commandes basées sur les noms de modules.
	 */
	function allCommands() {
		return Array.from(
			store.moduleManager().modules().keys(),
			(k) => `/${k.toLowerCase()}`,
		).sort();
	}

	/**
	 * Applique les paramètres d'un salon.
	 */
	function applyChannelSettings(target: string, modesSettings: Command<"MODE">["modes"]) {
		const module = store.moduleManager().get("MODE").expect("Récupération du module `MODE`");
		module.send({ target, modes: modesSettings });
	}

	/**
	 * Change le pseudonyme de l'utilisateur actuel.
	 */
	function changeNick(newNick: string) {
		const module = store.moduleManager().get("NICK").expect("Récupération du module `NICK`");
		module?.send({ nickname: newNick });
	}

	/**
	 * Change de chambre.
	 */
	function changeRoom(target: Origin | RoomID) {
		let roomID: RoomID;

		if (typeof target === "string") {
			roomID = target;
		} else {
			roomID = target.id;
		}

		if (!store.roomManager().has(roomID)) {
			return;
		}

		store.roomManager().setCurrent(roomID);
	}

	/**
	 * Émet la commande /LIST vers le serveur.
	 */
	function channelList(channels?: Array<string>) {
		changeRoom(ChannelListCustomRoom.ID);
		const module = store.moduleManager().get("LIST").expect("Récupération du module `LIST`");
		module?.send({ channels });
	}

	/**
	 * Vérifie qu'un utilisateur est bloqué.
	 */
	function checkUserIsBlocked(user: User): boolean {
		return store.userManager().isBlocked(user.id);
	}

	/**
	 * Ferme une chambre. Dans le cas d'un salon, cette fonction émet la
	 * commande /PART vers le serveur.
	 */
	function closeRoom(target: Origin | RoomID, message?: string) {
		let roomID: RoomID;
		if (typeof target === "string") {
			roomID = target;
		} else {
			roomID = target.id;
		}

		if (!isChannel(roomID)) {
			store.roomManager().remove(roomID);
			return;
		}

		const module = store.moduleManager().get("PART").expect("Récupération du module `PART`");
		module.send({ channels: [roomID], message });
	}

	/**
	 * Se connecte au serveur de Chat.
	 */
	function connect(connectUserInfo: ConnectUserInfo) {
		store.setConnectUserInfo(connectUserInfo);
		store.connectWebsocket(connectUserInfo.websocketServerURL);

		if (import.meta.env.DEV) {
			store.websocket().onAnyOutgoing((evtName, ...payload) => {
				console.groupCollapsed("> Event %s", evtName);
				console.debug("Données envoyées:");
				console.table(payload);
				console.groupEnd();
			});

			store.websocket().onAny((evtName, ...payload) => {
				console.groupCollapsed("< Event %s", evtName);
				console.debug("Données reçues:");
				console.table(payload);
				console.groupEnd();
			});
		}

		store.websocket().once("connect", () => {
			for (const [_, handler] of store.handlerManager().handlers()) {
				handler.listen();
			}
			for (const [_, module] of store.moduleManager().modules()) {
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

			store.websocket().once("disconnect", (reason) => {
				setTimeout(() => store.disconnectError(reason), 1_500);
			});
		});
	}

	/**
	 * @see ChatStore#getCurrentSelectedChannelMember
	 */
	function getCurrentSelectedChannelMember(room: ChannelRoom): Option<ChannelMemberSelected> {
		return store.getCurrentSelectedChannelMember(room);
	}

	/**
	 * Émet la commande /SILENCE +nickname vers le serveur.
	 */
	function ignoreUser(nickname: string) {
		const module = store
			.moduleManager()
			.get("SILENCE")
			.expect("Récupération du module `SILENCE`");
		module.send({ nickname: `+${nickname}` });
	}

	/**
	 * Émet la commande /JOIN vers le serveur.
	 */
	function joinChannel(channelsRaw: ChannelID, keysRaw?: string) {
		const module = store.moduleManager().get("JOIN").expect("Récupération du module `JOIN`");
		const channels = channelsRaw.split(",") as Array<ChannelID>;
		const keys = keysRaw?.split(",");
		module.send({ channels, keys });
	}

	/**
	 * Émet la commande /KICK vers le serveur.
	 */
	function kickChannelMember(channel: ChannelRoom, member: ChannelMember, comment = "Kick.") {
		const module = store.moduleManager().get("KICK").expect("Récupération du module `KICK`");
		module.send({ channels: [channel.name], knicks: [member.nickname], comment });
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
			priv.addParticipant(new PrivateParticipant(store.client()).withIsCurrentClient(true));
			const maybeUser = store.userManager().find(origin.id);
			maybeUser.then((user) => priv.addParticipant(new PrivateParticipant(user)));
			return priv;
		});

		store.roomManager().setCurrent(room.id());

		// store.emit("QUERY", { nickname: name });
	}

	/**
	 * Ouvre une chambre. Dans le cas d'un salon, cette fonction émet la
	 * commande /JOIN vers le serveur (sans clés).
	 */
	function openRoom(target: Origin | RoomID) {
		let roomID: RoomID;
		if (typeof target === "string") {
			roomID = target;
		} else {
			roomID = target.id;
		}

		if (!isChannel(roomID)) {
			store.roomManager().setCurrent(roomID);
			return;
		}

		if (store.roomManager().has(roomID)) {
			const channel = store.roomManager().get(roomID).unwrap();
			assertChannelRoom(channel);
			if (!channel.isClosed() && !channel.kicked) {
				return;
			}
		}

		const module = store.moduleManager().get("JOIN").expect("Récupération du module `JOIN`");
		module.send({ channels: [roomID] });
	}

	/**
	 * (Dé-)sélectionne un utilisateur d'un salon.
	 */
	function toggleSelectChannelMember(room: ChannelRoom, origin: Origin) {
		const maybeSelectedChannelMember = store.getCurrentSelectedChannelMember(room);
		if (maybeSelectedChannelMember.is_some()) {
			const selectedChannelMember = maybeSelectedChannelMember.unwrap();
			if (selectedChannelMember.member.id === origin.id) {
				store.unsetSelectedUser(room, origin);
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
	function sendMessage(name: RoomID, message: string) {
		const room = store
			.roomManager()
			.get(name)
			.or_else(() =>
				store
					.userManager()
					.findByNickname(name)
					.and_then((user) => store.roomManager().get(user.id)),
			)
			.unwrap_unchecked();
		room.addInputHistory(message);

		if (!message.startsWith("/")) {
			const words = message.split(" ");

			if (name.startsWith("#")) {
				const module = store
					.moduleManager()
					.get("PUBMSG")
					.expect("Récupération du module `PUBMSG`");
				module.input(name, ...words);
			} else {
				const module = store
					.moduleManager()
					.get("PRIVMSG")
					.expect("Récupération du module `PRIVMSG`");
				module.input(name, ...words);
			}
			return;
		}

		const words = message.slice(1).split(" ");
		const [commandName, ...args] = words;

		const maybeModule = store.moduleManager().get(commandName.toUpperCase() as CommandsNames);

		if (maybeModule.is_none()) {
			console.error(
				"[%s]: le module « %s » n'a pas été trouvé.",
				ChatStore.NAME,
				commandName,
			);
			return;
		}

		const module = maybeModule.unwrap();

		module.input(name, ...args);
	}

	/**
	 * Émet les commandes liées aux niveaux d'accès vers le serveur.
	 */
	function sendSetAccessLevel(
		channel: ChannelRoom,
		member: ChannelMember,
		accessLevel: ChannelAccessLevel,
	) {
		const payload = { channel: channel.name, nicknames: [member.nickname] };

		let maybeModule: Option<CommandInterface<"OP">> = None();

		switch (accessLevel) {
			case ChannelAccessLevel.Owner:
				maybeModule = store.moduleManager().get("QOP");
				break;
			case ChannelAccessLevel.AdminOperator:
				maybeModule = store.moduleManager().get("AOP");
				break;
			case ChannelAccessLevel.Operator:
				maybeModule = store.moduleManager().get("OP");
				break;
			case ChannelAccessLevel.HalfOperator:
				maybeModule = store.moduleManager().get("HOP");
				break;
			case ChannelAccessLevel.Vip:
				maybeModule = store.moduleManager().get("VIP");
				break;
		}

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
		member: ChannelMember,
		accessLevel: ChannelAccessLevel,
	) {
		const payload = { channel: channel.name, nicknames: [member.nickname] };

		let maybeModule: Option<CommandInterface<"OP">> = None();

		switch (accessLevel) {
			case ChannelAccessLevel.Owner:
				maybeModule = store.moduleManager().get("DEQOP");
				break;
			case ChannelAccessLevel.AdminOperator:
				maybeModule = store.moduleManager().get("DEAOP");
				break;
			case ChannelAccessLevel.Operator:
				maybeModule = store.moduleManager().get("DEOP");
				break;
			case ChannelAccessLevel.HalfOperator:
				maybeModule = store.moduleManager().get("DEHOP");
				break;
			case ChannelAccessLevel.Vip:
				maybeModule = store.moduleManager().get("DEVIP");
				break;
		}

		const module = maybeModule.expect(
			`Récupération du module \`AccessLevel (${accessLevel})\``,
		);

		module?.send(payload);
	}

	/**
	 * Émet la commande /SILENCE - vers le serveur.
	 */
	function unignoreUser(nickname: string) {
		const module = store
			.moduleManager()
			.get("SILENCE")
			.expect("Récupération du module `SILENCE`");
		module.send({ nickname: `-${nickname}` });
	}

	/**
	 * Émet la commande /TOPIC vers le serveur.
	 */
	function updateTopic(channelName: ChannelID, topic?: string) {
		const module = store.moduleManager().get("TOPIC").expect("Récupération du module `TOPIC`");
		module.send({ channel: channelName, topic });
	}

	/**
	 * Émet la commande /BAN vers le serveur.
	 */
	function banChannelMemberMask(channel: ChannelRoom, mask: MaskAddr) {
		const module = store.moduleManager().get("BAN").expect("Récupération du module `BAN`");
		module.send({ channels: [channel.name], masks: [mask] });
	}

	/**
	 * Émet la commande /UNBAN vers le serveur.
	 */
	function unbanChannelMemberMask(channel: ChannelRoom, mask: MaskAddr) {
		const module = store.moduleManager().get("UNBAN").expect("Récupération du module `UNBAN`");
		module.send({ channels: [channel.name], masks: [mask] });
	}

	return {
		store,

		allCommands,
		applyChannelSettings,
		banChannelMemberMask,
		changeNick,
		changeRoom,
		channelList,
		checkUserIsBlocked,
		closeRoom,
		connect,
		getCurrentSelectedChannelMember,
		ignoreUser,
		joinChannel,
		kickChannelMember,
		listen,
		openPrivateOrCreate,
		openRoom,
		sendMessage,
		sendSetAccessLevel,
		sendUnsetAccessLevel,
		toggleSelectChannelMember,
		unbanChannelMemberMask,
		unignoreUser,
		updateTopic,
	};
});
