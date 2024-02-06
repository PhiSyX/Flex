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
	id: UUID;
	nickname: string;
	ident: string;
	host: {
		cloaked: string;
		vhost?: string;
	};
}

declare interface ChannelOrigin {
	access_level: Array<string>;
	id: UUID;
	nickname: string;
	ident: string;
	host: {
		cloaked: string;
		vhost?: string;
	};
}

// NOTE(phisyx): les réponses des commandes sont déclarées dans chaque modules
//  	EXAMPLE: ~/modules/<module>/socket.d.ts
declare interface CommandResponsesFromServer {}

declare interface CommandResponsesReplies {
	RPL_WELCOME: {
		nickname: string;
		ident: string;
		host: string;
		tags: { client_id: UUID };
	};
	RPL_YOURHOST: { servername: string; version: string };
	RPL_CREATED: { date: string };
}

declare interface ErrorReplies {
	// biome-ignore lint/complexity/noBannedTypes: ?
	ERROR: {};
	// biome-ignore lint/complexity/noBannedTypes: ?
	ERR_ALREADYREGISTERED: {};
	ERR_CANNOTSENDTOCHAN: { channel_name: string };
	ERR_CHANOPRIVSNEEDED: { channel: string };
	ERR_ERRONEUSNICKNAME: { nickname: string };
	ERR_NICKNAMEINUSE: { nickname: string };
	// biome-ignore lint/complexity/noBannedTypes: ?
	ERR_NOPRIVILEGES: {};
	ERR_NOSUCHCHANNEL: { channel_name: string };
	ERR_NOSUCHNICK: { nickname: string };
	ERR_NOTONCHANNEL: { channel: string };
	ERR_USERNOTINCHANNEL: { channel: string; nick: string };
}

declare interface Replies
	extends CommandResponsesFromServer,
		CommandResponsesReplies,
		ErrorReplies {}

declare type RepliesNames = keyof Replies;
declare type Reply<T> = T extends keyof Replies ? Replies[T] : never;

declare type GenericCommandResponseFromServer<T extends keyof CommandResponsesFromServer> =
	CommandResponsesFromServer[T] & {
		name: T;
		tags: { msgid: string } & Record<string, unknown>;
		origin: Origin;
	};

declare type GenericCommandResponseReply<T extends keyof CommandResponsesReplies> =
	CommandResponsesReplies[T] & {
		name: T;
		code: number;
		message: string;
		tags: { msgid: string } & Record<string, unknown>;
		origin: Origin;
	};

declare type GenericErrorReply<T extends keyof ErrorReplies> = ErrorReplies[T] & {
	name: T;
	code: number;
	reason: string;
	tags: { msgid: string } & Record<string, unknown>;
	origin: Origin;
};

declare type GenericReply<T extends RepliesNames> = T extends keyof CommandResponsesFromServer
	? GenericCommandResponseFromServer<T>
	: T extends keyof CommandResponsesReplies
	  ? GenericCommandResponseReply<T>
	  : T extends keyof ErrorReplies
		  ? GenericErrorReply<T>
		  : never;
