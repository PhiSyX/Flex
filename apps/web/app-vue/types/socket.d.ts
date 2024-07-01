// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// import type {} from "socket.io-client";

// --------- //
// Interface //
// --------- //

declare interface SocketEventHandler {
	listen(): void;
}

declare interface SocketEventInterface<R extends RepliesNames>
	extends SocketEventHandler {
	handle(data: GenericReply<R>, ...userData: Array<unknown>): void;
}

// Socket Event

declare type ServerToClientEvent = {
	// NOTE: mes types
	[K in RepliesNames]: (_: GenericReply<K>) => void;
} & {
	// NOTE: types par socket.io
	connect: () => void;
	disconnect: (_: string) => void;
};

declare type ClientToServerEvent = {
	[C in CommandsNames]: (data: Command<C>) => void;
};

type SocketIOClientSocket<S, C> = import("socket.io-client").Socket;

declare interface TypeSafeSocket
	extends SocketIOClientSocket<ServerToClientEvent, ClientToServerEvent> {
	emit<E extends keyof ClientToServerEvent>(
		eventName: E,
		...payload: Parameters<ClientToServerEvent[E]>
	);

	on<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	): void;

	once<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	): void;
}
