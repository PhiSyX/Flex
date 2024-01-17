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
import { ReplyWelcomeHandler } from "~/handlers/replies/ReplyWelcomeHandler";
import { Room, RoomID } from "~/room/Room";
import { RoomManager } from "~/room/RoomManager";
import { ServerCustomRoom } from "~/room/ServerCustomRoom";
import { ClientIDStorage } from "~/storage/ClientIDStorage";
import { Commands } from "~/types/commands";
import { ClientToServerEvent, ServerToClientEvent } from "~/types/socket";

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

		self.replyWelcomeHandler = new ReplyWelcomeHandler(self);
		self.errorNicknameinuseHandler = new ErrorNicknameinuseHandler(self);

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

	private _autoJoinChannels: Array<string> = [];
	private _connectUserInfo: Option<ConnectUserInfo> = None();
	private _client: Option<{
		nickname: string;
		ident: string;
		host: {
			cloaked: string;
			vhost?: string;
		};
	}> = None();
	private _clientIDStorage: ClientIDStorage = new ClientIDStorage();
	private _isClientConnected = false;
	private _network: Option<string> = None();
	private _roomManager: RoomManager = new RoomManager();
	private _ws: Option<Socket<ServerToClientEvent, ClientToServerEvent>> =
		None();

	declare replyWelcomeHandler: ReplyWelcomeHandler;
	declare errorNicknameinuseHandler: ErrorNicknameinuseHandler;

	// ------- //
	// Méthode //
	// ------- //

	listenAllEvents() {
		this.replyWelcomeHandler.listen();
		this.errorNicknameinuseHandler.listen();
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
		event_name: E,
		...payload: Parameters<ClientToServerEvent[E]>
	): void {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.emit(event_name, ...payload);
	}

	isConnected(): boolean {
		return this._isClientConnected;
	}

	getAutoJoinChannels(): Array<string> {
		return this._autoJoinChannels;
	}

	getConnectUserInfo() {
		return this._connectUserInfo.expect(
			"Information de connexion de l'utilisateur",
		);
	}

	me(): {
		nickname: string;
		ident: string;
		host: {
			cloaked: string;
			vhost?: string;
		};
	} {
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

	off<K extends keyof ServerToClientEvent>(event_name: K) {
		this._ws
			.expect("Instance WebSocket connecté au serveur")
			.off(event_name);
	}

	on<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
	) {
		this._ws.expect("Instance WebSocket connecté au serveur").on(
			event_name,
			// @ts-expect-error : listener
			listener,
		);
	}

	once<K extends keyof ServerToClientEvent>(
		event_name: K,
		listener: ServerToClientEvent[K],
	) {
		this._ws.expect("Instance WebSocket connecté au serveur").once(
			event_name,
			// @ts-expect-error : listener
			listener,
		);
	}

	roomManager(): RoomManager {
		return this._roomManager;
	}

	setAutoJoinChannels(channels: Array<string>) {
		this._autoJoinChannels = channels;
	}

	setConnectUserInfo(connectUserInfo: ConnectUserInfo) {
		this._connectUserInfo.replace(connectUserInfo);
	}

	setConnected(b: boolean): void {
		this._isClientConnected = b;
	}

	setClientID(client_id: string): void {
		this._clientIDStorage.set(client_id);
	}

	setMe(me: {
		nickname: string;
		ident: string;
		host: {
			cloaked: string;
			vhost?: string;
		};
	}) {
		this._client.replace(me);
	}

	setNetworkName(network_name: string): void {
		this._network.replace(network_name);
	}

	websocket(): Socket<ServerToClientEvent, ClientToServerEvent> {
		return this._ws.expect("Instance WebSocket connecté au serveur");
	}
}

export const useChatStore = defineStore(ChatStore.NAME, () => {
	const store = ChatStore.default();

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
		event_name: K,
		listener: ServerToClientEvent[K],
		options: { once: boolean } = { once: false },
	): void {
		if (options.once) {
			store.once(event_name, listener);
		} else {
			store.on(event_name, listener);
		}
	}

	return { connect, listen };
});
