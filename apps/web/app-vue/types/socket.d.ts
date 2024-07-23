// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

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

type SocketDisconnectReason =
	import("socket.io-client").Socket.DisconnectReason;

type SocketDisconnectDescription =
	| Error
	| { description: string; context?: unknown };

declare type ServerToClientEvent = {
	// NOTE: mes types
	[K in RepliesNames]: (_: GenericReply<K>) => void;
} & {
	// NOTE: types par socket.io
	connect: () => void;
	connect_error: (err: Error) => void;
	disconnect: (
		reason: SocketDisconnectReason,
		description?: SocketDisconnectDescription,
	) => void;
};

declare type ClientToServerEvent = {
	[C in CommandsNames]: (data: Command<C>) => void;
};

type SocketEventsMap = {
	// biome-ignore lint/suspicious/noExplicitAny: ;-)
	[event: string]: any;
};

type SocketIOClientSocket<
	S extends SocketEventsMap,
	C extends SocketEventsMap,
> = import("socket.io-client").Socket<S, C>;

declare interface TypeSafeSocket
	extends SocketIOClientSocket<ServerToClientEvent, ClientToServerEvent> {
	emit<E extends keyof ClientToServerEvent>(
		eventName: E,
		...payload: Parameters<ClientToServerEvent[E]>
	): this;
	emit(eventName: unknown, ...payload: Array<unknown>): this;

	on<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	): this;
	on(eventName: unknown, listener: unknown): this;

	once<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener: ServerToClientEvent[K],
	): void;
	once(eventName: unknown, listener: unknown): this;
}
