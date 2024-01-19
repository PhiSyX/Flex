// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ---- //
// Type //
// ---- //

declare interface Origin {
	nickname: string;
	ident: string;
	host: {
		cloaked: string;
		vhost?: string;
	};
}

declare interface CommandResponsesFromServer {
	NICK: {
		new_nickname: string;
		old_nickname: string;
	};
}

declare interface CommandResponsesReplies {
	RPL_WELCOME: {
		nickname: string;
		ident: string;
		host: string;
		tags: { client_id: string };
	};

	RPL_YOURHOST: {
		servername: string;
		version: string;
	};

	RPL_CREATED: {
		date: string;
	};
}

declare interface ErrorReplies {
	// biome-ignore lint/complexity/noBannedTypes: ?
	ERR_ALREADYREGISTERED: {};
	ERR_NICKNAMEINUSE: { nickname: string };
	ERR_ERRONEUSNICKNAME: { nickname: string };
}

declare interface Replies
	extends CommandResponsesFromServer,
		CommandResponsesReplies,
		ErrorReplies {}

declare type RepliesNames = keyof Replies;
declare type Reply<T> = T extends keyof Replies ? Replies[T] : never;

declare type GenericCommandResponseFromServer<
	T extends keyof CommandResponsesFromServer,
> = CommandResponsesFromServer[T] & {
	name: T;
	tags: { msgid: string } & Record<string, unknown>;
	origin: Origin;
};

declare type GenericCommandResponseReply<
	T extends keyof CommandResponsesReplies,
> = CommandResponsesReplies[T] & {
	name: T;
	code: number;
	message: string;
	tags: { msgid: string } & Record<string, unknown>;
	origin: Origin;
};

declare type GenericErrorReply<T extends keyof ErrorReplies> =
	ErrorReplies[T] & {
		name: T;
		code: number;
		reason: string;
		tags: { msgid: string } & Record<string, unknown>;
		origin: Origin;
	};

declare type GenericReply<T extends RepliesNames> =
	T extends keyof CommandResponsesFromServer
		? GenericCommandResponseFromServer<T>
		: T extends keyof CommandResponsesReplies
		  ? GenericCommandResponseReply<T>
		  : T extends keyof ErrorReplies
			  ? GenericErrorReply<T>
			  : never;