// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

declare interface SocketEventHandler {
	listen(): void;
}

declare interface SocketEventInterface<R extends RepliesNames>
	extends SocketEventHandler {
	handle(data: GenericReply<R>, ...userData: Array<unknown>): void;
}

declare type ClientToServerEvent = {
	[C in CommandsNames]: (data: Command<C>) => void;
};

type SocketDisconnectDescription =
	| Error
	| { description: string; context?: unknown };

declare type ServerToClientEvent = {
	// NOTE: mes types
	[K in RepliesNames]: (_: GenericReply<K>) => void;
} & {
	connect: () => void;
	connect_error: (err: Error) => void;
	disconnect: (
		reason: string,
		description?: SocketDisconnectDescription,
	) => void;
};

declare interface TypeSafeSocket {
	emit<E extends keyof ClientToServerEvent>(
		eventName: E,
		...payload: Parameters<ClientToServerEvent[E]>
	): this;
	emit(eventName: unknown, ...payload: Array<unknown>): this;

	off<K extends keyof ServerToClientEvent>(
		eventName: K,
		listener?: ServerToClientEvent[K],
	): this;
	off(eventName: unknown, listener?: unknown): this;

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
