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

import { ErrorNicknameinuseHandler } from "~/handlers/errors/ErrorNicknameinuseHandler";
import { ReplyCreatedHandler } from "~/handlers/replies/ReplyCreatedHandler";
import { ReplyWelcomeHandler } from "~/handlers/replies/ReplyWelcomeHandler";
import { ReplyYourhostHandler } from "~/handlers/replies/ReplyYourhostHandler";
import { Module } from "~/modules/interface";
import { JoinModule } from "~/modules/join/module";
import { Room, RoomID } from "~/room/Room";
import { RoomManager } from "~/room/RoomManager";
import { ServerCustomRoom } from "~/room/ServerCustomRoom";
import { ClientIDStorage } from "~/storage/ClientIDStorage";

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

		self.errorsHandlers.add(new ErrorNicknameinuseHandler(self));

		self.modules.set(JoinModule.NAME, JoinModule.create(self));

		const thisServer = new ServerCustomRoom("Flex");
		const rooms: Map<RoomID, Room> = new Map([
			[thisServer.id(), thisServer],
		]);

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
	private _network: Option<string> = None();
	private _roomManager: RoomManager = new RoomManager();
	private _ws: Option<Socket<ServerToClientEvent, ClientToServerEvent>> =
		None();

	private repliesHandlers: Set<SocketEventHandler> = new Set();
	private errorsHandlers: Set<SocketEventHandler> = new Set();

	public modules: Map<string, Module> = new Map();

	// ------- //
	// Méthode //
	// ------- //

	listenAllEvents() {
		for (const handler of this.repliesHandlers) {
			handler.listen();
		}

		for (const handler of this.errorsHandlers) {
			handler.listen();
		}

		for (const [moduleName, module] of this.modules) {
			console.info(
				"Le module « %s » est maintenant en écoute.",
				moduleName,
			);
			module.listen();
		}
	}

	connectWebsocket(websocketServerURL: string) {
		console.info(
			"Connexion au serveur de WebSocket « %s »",
			websocketServerURL,
		);

		let clientID = this._clientIDStorage.maybe().unwrap_or("") as
			| string
			| null;

		if (clientID?.length === 0) {
			clientID = null;
		}

		this._ws.replace(
			io(websocketServerURL, { auth: { client_id: clientID } }),
		);
	}

	emit<E extends keyof Commands>(
		eventName: E,
		...payload: Parameters<ClientToServerEvent[E]>
	): void {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.emit(eventName, ...payload);
	}

	isConnected(): boolean {
		return this.network().isConnected();
	}

	getAutoJoinChannels(): Array<string> {
		return this.getConnectUserInfo().channels.split(",");
	}

	getConnectUserInfo() {
		return this._connectUserInfo.expect(
			"Information de connexion de l'utilisateur",
		);
	}

	isMe(origin: Origin): boolean {
		return (
			this.me().nickname.toLowerCase() === origin.nickname.toLowerCase()
		);
	}

	me(): Origin {
		return this._client.expect("Le client courant connecté");
	}

	network(): ServerCustomRoom {
		return this.roomManager()
			.get(this.networkName())
			.unwrap_unchecked() as ServerCustomRoom;
	}

	networkName(): string {
		return this._network.expect("Nom du réseau");
	}

	off<K extends keyof ServerToClientEvent>(eventName: K) {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.off(eventName);
	}

	on<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	) {
		this._ws.expect("Instance WebSocket connecté au serveur").on(
			eventName,
			// @ts-expect-error : listener
			listener,
		);
	}

	once<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	) {
		this._ws.expect("Instance WebSocket connecté au serveur").once(
			eventName,
			// @ts-expect-error : listener
			listener,
		);
	}

	roomManager(): RoomManager {
		return this._roomManager;
	}

	setConnectUserInfo(connectUserInfo: ConnectUserInfo) {
		this._connectUserInfo.replace(connectUserInfo);
	}

	setConnected(b: boolean): void {
		this.network().setConnected(b);
	}

	setClientID(clientID: string): void {
		this._clientIDStorage.set(clientID);
	}

	setMe(me: Origin) {
		this._client.replace(me);
	}

	setNetworkName(networkName: string): void {
		this._network.replace(networkName);
	}

	websocket(): Socket<ServerToClientEvent, ClientToServerEvent> {
		return this._ws.expect("Instance WebSocket connecté au serveur");
	}
}

export const useChatStore = defineStore(ChatStore.NAME, () => {
	const store = ChatStore.default();

	function changeRoom(name: string) {
		if (!store.roomManager().has(name)) {
			return;
		}
		store.roomManager().setCurrent(name);

		const current = store.roomManager().current();

		current.unsetTotalUnreadEvents();
		current.unsetTotalUnreadMessages();
	}

	function closeRoom(name: string, message?: string) {
		store.roomManager().remove(name);

		console.debug("fermeture de la chambre avec le message: %s", message);
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

	function sendMessage(name: string, message: string) {
		if (!message.startsWith("/")) {
			console.debug(
				"[%s]: message à envoyer sur « %s ». Message: « %s »",
				ChatStore.NAME,
				name,
				message,
			);

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

	return {
		changeRoom,
		closeRoom,
		connect,
		listen,
		sendMessage,
		store,
	};
});
