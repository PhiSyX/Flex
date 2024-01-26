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
import { ErrorBadchannelkeyHandler } from "~/handlers/errors/ErrorBadchannelkeyHandler";
import { ErrorCannotsendtochanHandler } from "~/handlers/errors/ErrorCannotsendtochanHandler";
import { ErrorChanoprivsneeded } from "~/handlers/errors/ErrorChanoprivsneeded";
import { ErrorNicknameinuseHandler } from "~/handlers/errors/ErrorNicknameinuseHandler";
import { ErrorNosuchchannelHandler } from "~/handlers/errors/ErrorNosuchchannelHandler";
import { ErrorNosuchnickHandler } from "~/handlers/errors/ErrorNosuchnickHandler";
import { ErrorNotonchannelHandler } from "~/handlers/errors/ErrorNotonchannelHandler";
import { ErrorUsernotinchannelHandler } from "~/handlers/errors/ErrorUsernotinchannelHandler";
import { ReplyCreatedHandler } from "~/handlers/replies/ReplyCreatedHandler";
import { ReplyWelcomeHandler } from "~/handlers/replies/ReplyWelcomeHandler";
import { ReplyYourhostHandler } from "~/handlers/replies/ReplyYourhostHandler";
import { IgnoreModule, UnignoreModule } from "~/modules/(un)ignore/module";
import { Module } from "~/modules/interface";
import { JoinModule } from "~/modules/join/module";
import { KickModule } from "~/modules/kick/module";
import {
	AccessLevelAOPModule,
	AccessLevelHOPModule,
	AccessLevelOPModule,
	AccessLevelQOPModule,
	AccessLevelVIPModule,
} from "~/modules/mode/access-level/module";
import { ModeModule } from "~/modules/mode/module";
import { NickModule } from "~/modules/nick/module";
import { PartModule } from "~/modules/part/module";
import { PrivmsgModule } from "~/modules/privmsg/module";
import { OperModule } from "~/modules/oper/module";
import { QuitModule } from "~/modules/quit/module";
import { TopicModule } from "~/modules/topic/module";
import { AwayModule } from "~/modules/user-status/module";
import { PrivateNick } from "~/private/PrivateNick";
import { PrivateRoom } from "~/private/PrivateRoom";
import { Room, RoomID } from "~/room/Room";
import { RoomManager } from "~/room/RoomManager";
import { ServerCustomRoom } from "~/room/ServerCustomRoom";
import { ClientIDStorage } from "~/storage/ClientIDStorage";
import { User, UserID } from "~/user/User";

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
			.add(new ErrorBadchannelkeyHandler(self))
			.add(new ErrorChanoprivsneeded(self))
			.add(new ErrorCannotsendtochanHandler(self))
			.add(new ErrorNicknameinuseHandler(self))
			.add(new ErrorNosuchchannelHandler(self))
			.add(new ErrorNosuchnickHandler(self))
			.add(new ErrorNotonchannelHandler(self))
			.add(new ErrorUsernotinchannelHandler(self));

		self.modules.set(AwayModule.NAME, AwayModule.create(self));
		self.modules.set(IgnoreModule.NAME, IgnoreModule.create(self));
		self.modules.set(JoinModule.NAME, JoinModule.create(self));
		self.modules.set(KickModule.NAME, KickModule.create(self));
		self.modules.set(ModeModule.NAME, ModeModule.create(self));
		self.modules.set(NickModule.NAME, NickModule.create(self));
		self.modules.set(PartModule.NAME, PartModule.create(self));
		self.modules.set(PrivmsgModule.NAME, PrivmsgModule.create(self));
		self.modules.set(OperModule.NAME, OperModule.create(self));
		self.modules.set(QuitModule.NAME, QuitModule.create(self));
		self.modules.set(TopicModule.NAME, TopicModule.create(self));
		self.modules.set(UnignoreModule.NAME, UnignoreModule.create(self));

		/** Channel access level */
		self.modules.set(AccessLevelQOPModule.NAME, AccessLevelQOPModule.create(self));
		self.modules.set(AccessLevelAOPModule.NAME, AccessLevelAOPModule.create(self));
		self.modules.set(AccessLevelOPModule.NAME, AccessLevelOPModule.create(self));
		self.modules.set(AccessLevelHOPModule.NAME, AccessLevelHOPModule.create(self));
		self.modules.set(AccessLevelVIPModule.NAME, AccessLevelVIPModule.create(self));

		const thisServer = new ServerCustomRoom("Flex").withID("Flex");
		const rooms: Map<RoomID, Room> = new Map([[thisServer.id(), thisServer]]);

		self.setNetworkName(thisServer.id());
		self.roomManager().extends(rooms);
		self.roomManager().setCurrent(thisServer.id());

		return self;
	}

	// --------- //
	// Propriété //
	// --------- //

	private _connectUserInfo: Option<ConnectUserInfo> = None();
	private _client: Option<Origin> = None();
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

	addUserToBlocklist(user: User) {
		this._usersBlocked.set(user.id, user);
	}

	changeUserNickname(oldNickname: string, newNickname: string) {
		const user = this.findUserByNickname(oldNickname).unwrap();
		this._nicksUsers.delete(oldNickname);
		user.nickname = newNickname;
	}

	clientID() {
		return this.me().id;
	}

	connectWebsocket(websocketServerURL: string) {
		console.info("Connexion au serveur de WebSocket « %s »", websocketServerURL);

		let clientID = this._clientIDStorage.maybe().unwrap_or("") as string | null;

		if (clientID?.length === 0) {
			clientID = null;
		}

		this._ws.replace(io(websocketServerURL, { auth: { client_id: clientID } }));
	}

	emit<E extends keyof Commands>(eventName: E, ...payload: Parameters<ClientToServerEvent[E]>) {
		this._ws.expect("Instance WebSocket connecté au serveur").emit(eventName, ...payload);
	}

	findUser(userID: string): Option<User> {
		return Option.from(this._users.get(userID));
	}

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

	getAutoJoinChannels(): Array<string> {
		return this.getConnectUserInfo().channels.split(",");
	}

	getConnectUserInfo(): ConnectUserInfo {
		return this._connectUserInfo.expect("Information de connexion de l'utilisateur");
	}

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

	isConnected(): boolean {
		return this.network().isConnected();
	}

	isUserBlocked(user: User): boolean {
		return this._usersBlocked.has(user.id);
	}

	isMe(origin: Origin | string): boolean {
		if (typeof origin === "string") {
			return (
				this.me().id === origin || this.me().nickname.toLowerCase() === origin.toLowerCase()
			);
		}

		return this.me().id === origin.id;
	}

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

	me(): Origin {
		return this._client.expect("Le client courant connecté");
	}

	network(): ServerCustomRoom {
		return this.roomManager().get(this.networkName()).unwrap_unchecked() as ServerCustomRoom;
	}

	networkName(): string {
		return this._network.expect("Nom du réseau");
	}

	nickname(): string {
		return this.me().nickname;
	}

	off<K extends keyof ServerToClientEvent>(eventName: K) {
		this._ws.expect("Instance WebSocket connecté au serveur").off(eventName);
	}

	on<K extends keyof ServerToClientEvent>(eventName: K, listener: ServerToClientEvent[K]) {
		this._ws.expect("Instance WebSocket connecté au serveur").on(
			eventName,
			// @ts-expect-error : listener
			listener,
		);
	}

	once<K extends keyof ServerToClientEvent>(eventName: K, listener: ServerToClientEvent[K]) {
		this._ws.expect("Instance WebSocket connecté au serveur").once(
			eventName,
			// @ts-expect-error : listener
			listener,
		);
	}

	removeUserToBlocklist(user: User): boolean {
		return this._usersBlocked.delete(user.id);
	}

	removeChannelForUser(channelID: ChannelID, userID: UserID) {
		this._users.get(userID)?.channels.delete(channelID);
	}

	roomManager(): RoomManager {
		return this._roomManager;
	}

	setConnectUserInfo(connectUserInfo: ConnectUserInfo) {
		this._connectUserInfo.replace(connectUserInfo);
	}

	setConnected(b: boolean) {
		this.network().setConnected(b);
	}

	setClientID(clientID: string) {
		this._clientIDStorage.set(clientID);
	}

	setMe(me: Origin) {
		this._client.replace(me);
	}

	setNetworkName(networkName: string) {
		this._network.replace(networkName);
	}

	setNickname(nickname: string) {
		this.me().nickname = nickname;
	}

	setSelectedUser(room: ChannelRoom, origin: Origin) {
		this._selectedUser.replace([room.id(), origin.id]);
	}

	unsetSelectedUser() {
		this._selectedUser = None();
	}

	websocket(): Socket<ServerToClientEvent, ClientToServerEvent> {
		return this._ws.expect("Instance WebSocket connecté au serveur");
	}
}

export const useChatStore = defineStore(ChatStore.NAME, () => {
	const store = ChatStore.default();

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

	function checkUserIsBlocked(user: User): boolean {
		return store.isUserBlocked(user);
	}

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

	function getSelectedUser(room: ChannelRoom): Option<ChannelSelectedUser> {
		return store.getSelectedUser(room);
	}

	function ignoreUser(nickname: string) {
		const ignoreModule = store.modules.get(IgnoreModule.NAME) as IgnoreModule;
		ignoreModule.send({ nickname });
	}

	function joinChannel(name: string) {
		const joinModule = store.modules.get(JoinModule.NAME) as JoinModule;
		joinModule.send({ channels: [name] });
	}

	function kickUser(channel: ChannelRoom, cnick: ChannelNick, comment = "Kick.") {
		const ignoreModule = store.modules.get(KickModule.NAME) as KickModule;
		ignoreModule.send({
			channels: [channel.name],
			knicks: [cnick.nickname],
			comment,
		});
	}

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

	function sendSetAccessLevel(
		channel: ChannelRoom,
		cnick: ChannelNick,
		accessLevel: ChannelAccessLevel,
	) {
		const payload = { channel: channel.name, nicknames: [cnick.nickname] };
		switch (accessLevel) {
			case ChannelAccessLevel.Owner:
				{
					const module = store.modules.get(
						AccessLevelQOPModule.NAME,
					) as AccessLevelQOPModule;
					module.sendSet(payload);
				}
				break;
			case ChannelAccessLevel.AdminOperator:
				{
					const module = store.modules.get(
						AccessLevelAOPModule.NAME,
					) as AccessLevelAOPModule;
					module.sendSet(payload);
				}
				break;
			case ChannelAccessLevel.Operator:
				{
					const module = store.modules.get(
						AccessLevelOPModule.NAME,
					) as AccessLevelOPModule;
					module.sendSet(payload);
				}
				break;
			case ChannelAccessLevel.HalfOperator:
				{
					const module = store.modules.get(
						AccessLevelHOPModule.NAME,
					) as AccessLevelHOPModule;
					module.sendSet(payload);
				}
				break;
			case ChannelAccessLevel.Vip:
				{
					const module = store.modules.get(
						AccessLevelVIPModule.NAME,
					) as AccessLevelVIPModule;
					module.sendSet(payload);
				}
				break;
		}
	}

	function sendUnsetAccessLevel(
		channel: ChannelRoom,
		cnick: ChannelNick,
		accessLevel: ChannelAccessLevel,
	) {
		const payload = { channel: channel.name, nicknames: [cnick.nickname] };
		switch (accessLevel) {
			case ChannelAccessLevel.Owner:
				{
					const module = store.modules.get(
						AccessLevelQOPModule.NAME,
					) as AccessLevelQOPModule;
					module.sendUnset(payload);
				}
				break;
			case ChannelAccessLevel.AdminOperator:
				{
					const module = store.modules.get(
						AccessLevelAOPModule.NAME,
					) as AccessLevelAOPModule;
					module.sendUnset(payload);
				}
				break;
			case ChannelAccessLevel.Operator:
				{
					const module = store.modules.get(
						AccessLevelOPModule.NAME,
					) as AccessLevelOPModule;
					module.sendUnset(payload);
				}
				break;
			case ChannelAccessLevel.HalfOperator:
				{
					const module = store.modules.get(
						AccessLevelHOPModule.NAME,
					) as AccessLevelHOPModule;
					module.sendUnset(payload);
				}
				break;
			case ChannelAccessLevel.Vip:
				{
					const module = store.modules.get(
						AccessLevelVIPModule.NAME,
					) as AccessLevelVIPModule;
					module.sendUnset(payload);
				}
				break;
		}
	}

	function unignoreUser(nickname: string) {
		const unignoreModule = store.modules.get(UnignoreModule.NAME) as UnignoreModule;
		unignoreModule.send({ nickname });
	}

	function updateTopic(channelName: string, topic: string) {
		const topicModule = store.modules.get(TopicModule.NAME) as TopicModule;
		topicModule.send({ channel: channelName, topic });
	}

	return {
		store,

		changeRoom,
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
