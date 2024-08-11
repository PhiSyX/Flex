// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

declare interface Origin {
	id: UserID;
	nickname: string;
	ident: string;
	host: {
		cloaked: string;
		vhost?: string;
	};
}

declare interface ChannelOrigin extends Origin
{
	access_level: Array<string>;
}

declare interface CommandResponsesFromServer {
	INVITE: { channel: ChannelID; nick: string };
	RPL_INVITING: { channel: ChannelID; nick: string };

	JOIN: { channel: ChannelID; forced: boolean };

	KICK: { channel: ChannelID; knick: Origin; reason: string };
	KILL: { knick: Origin; reason: string };

	MODE: {
		target: RoomID;
		updated: boolean;

		added: [
			| ["b", ModeApplyFlag<AccessControlMode>]
			| ["e", ModeApplyFlag<AccessControlMode>]
			| ["I", ModeApplyFlag<AccessControlMode>]
			| ["q", ModeApplyFlag<"owner">]
			| ["a", ModeApplyFlag<"admin_operator">]
			| ["o", ModeApplyFlag<"operator">]
			| ["h", ModeApplyFlag<"half_operator">]
			| ["v", ModeApplyFlag<"vip">]
			| ["k", ModeApplyFlag<{ key: string }>]
			| ["i", ModeApplyFlag<"invite_only">]
			| ["m", ModeApplyFlag<"moderate">]
			| ["n", ModeApplyFlag<"no_external_messages">]
			| ["O", ModeApplyFlag<"oper_only">]
			| ["s", ModeApplyFlag<"secret">]
			| ["t", ModeApplyFlag<"no_topic">],
		];

		removed: CommandResponsesFromServer["MODE"]["added"];
	};

	NICK: {
		new_nickname: string;
		old_nickname: string;
		tags: { user_id: UserID };
	};
	NOTICE: {
		tags: { msgid: UUID };
		target: string;
		text: string;
	};

	PART: {
		channel: ChannelID;
		message: string | null;
		forced_by: string | null;
	};
	PRIVMSG: {
		tags: {
			msgid: UUID;
			color_background: number | null;
			color_foreground: number | null;
			format_bold: boolean | null;
			format_italic: boolean | null;
			format_underline: boolean | null;
		};
		target: string;
		text: string;
	};
	PUBMSG: {
		tags: {
			msgid: UUID;
			color_background: number | null;
			color_foreground: number | null;
			format_bold: boolean | null;
			format_italic: boolean | null;
			format_underline: boolean | null;
		};
		channel: ChannelID;
		external: boolean;
		text: string;
		origin: {
			access_level?: Array<string>;
		};
	};

	QUIT: { message: string };

	SILENCE: {
		added?: boolean;
		removed?: boolean;
		users: Array<Origin>;
		updated: boolean;
	};

	UPGRADE_USER: {
		old_client_id: UserID;
		new_client_id: UserID;
		old_nickname: string;
		new_nickname: string;
	};
}

declare interface CommandResponsesReplies {
	RPL_WELCOME: {
		nickname: string;
		ident: string;
		host: string;
		tags: {
			client_id: UserID;
			token: string;
		};
	};
	RPL_YOURHOST: { servername: string; version: string };
	RPL_CREATED: { date: string };

	RPL_AWAY: { nick: string; message: string };
	// biome-ignore lint/complexity/noBannedTypes: ?
	RPL_NOWAWAY: {};
	// biome-ignore lint/complexity/noBannedTypes: ?
	RPL_UNAWAY: {};

	RPL_LIST: {
		channel: ChannelID;
		modes_settings: string;
		topic: string;
		total_members: number;
	};
	// biome-ignore lint/complexity/noBannedTypes: ?
	RPL_LISTEND: {};
	// biome-ignore lint/complexity/noBannedTypes: ?
	RPL_LISTSTART: {};

	RPL_NAMREPLY: {
		channel: ChannelID;
		code: number;
		users: Array<ChannelOrigin>;
	};
	// biome-ignore lint/complexity/noBannedTypes: ne retourne rien de particulier.
	RPL_ENDOFNAMES: {};

	RPL_NOTOPIC: {
		channel: ChannelID;
	};

	RPL_TOPIC: {
		channel: ChannelID;
		topic: string;
		updated: boolean;
		updated_by: string;
		updated_at: string;
	};

	RPL_YOUREOPER: {
		oper_type: "LocalOperator" | "GlobalOperator";
	};
}

declare interface ErrorReplies {
	// biome-ignore lint/complexity/noBannedTypes: ?
	ERROR: {};
	// biome-ignore lint/complexity/noBannedTypes: ?
	ERR_ALREADYREGISTERED: {};
	ERR_BANNEDFROMCHAN: { channel: ChannelID };
	ERR_CANNOTSENDTOCHAN: { channel_name: ChannelID };
	ERR_CHANOPRIVSNEEDED: { channel: ChannelID };
	ERR_ERRONEUSNICKNAME: { nickname: string };
	ERR_NICKNAMEINUSE: { nickname: string };
	// biome-ignore lint/complexity/noBannedTypes: ?
	ERR_NOPRIVILEGES: {};
	ERR_NOSUCHCHANNEL: { channel_name: ChannelID };
	ERR_NOSUCHNICK: { nickname: string };
	ERR_NOTONCHANNEL: { channel: ChannelID };
	ERR_USERNOTINCHANNEL: { channel: ChannelID; nick: string };
	ERR_USERONCHANNEL: { channel: ChannelID; user: string };
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
	tags: { msgid: UUID } & Record<string, unknown>;
	origin: Origin;
};

declare type GenericCommandResponseReply<
	T extends keyof CommandResponsesReplies,
> = CommandResponsesReplies[T] & {
	name: T;
	code: number;
	message: string;
	tags: { msgid: UUID } & Record<string, unknown>;
	origin: Origin;
};

declare type GenericErrorReply<T extends keyof ErrorReplies> =
	ErrorReplies[T] & {
		name: T;
		code: number;
		reason: string;
		tags: { msgid: UUID } & Record<string, unknown>;
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
