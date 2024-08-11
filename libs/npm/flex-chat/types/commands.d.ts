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

declare interface Commands {
	/**
	 * Unregistered client.
	 */
	PASS: { password: string };
	"NICK (unregistered)": { nickname: string };
	USER: { user: string; mode: number; realname: string };

	/**
	 * Registered client.
	 */
	"AUTH IDENTIFY": AuthIdentifyHttpResponse;
	AWAY: { text?: string };

	BAN: { channels: Array<string>; masks: Array<MaskAddr> };
	UNBAN: Commands["BAN"];
	BANEX: { channels: Array<string>; masks: Array<MaskAddr> };
	UNBANEX: Commands["BANEX"];
	INVITEX: { channels: Array<string>; masks: Array<MaskAddr> };
	UNINVITEX: Commands["INVITEX"];

	INVITE: { nickname: string; channel: ChannelID };

	JOIN: { channels: Array<ChannelID>; keys?: Array<string> };

	KICK: { channels: Array<string>; knicks: Array<string>; comment?: string };
	KILL: { nickname: string; comment?: string };

	// biome-ignore lint/complexity/noBannedTypes: ?
	LIST: {};

	// Start Mode
	MODE: {
		target: string;
		modes: Record<
			CommandResponsesFromServer["MODE"]["added"][0][0],
			string | Array<string> | boolean
		>;
	};
	QOP: { channel: ChannelID; nicknames: Array<string> };
	DEQOP: Commands["QOP"];
	OP: { channel: ChannelID; nicknames: Array<string> };
	DEOP: Commands["OP"];
	AOP: { channel: ChannelID; nicknames: Array<string> };
	DEAOP: Commands["AOP"];
	HOP: { channel: ChannelID; nicknames: Array<string> };
	DEHOP: Commands["HOP"];
	VIP: { channel: ChannelID; nicknames: Array<string> };
	DEVIP: Commands["VIP"];
	// End Mode

	NICK: { nickname: string };
	NOTICE: { targets: Array<string>; text: string };

	OPER: { name: string; password: string };

	PART: { channels: Array<ChannelID>; message?: string };
	PRIVMSG: {
		formats: {
			format_bold: boolean;
			format_italic: boolean;
			format_underline: boolean;
		};
		colors: {
			color_background: number | null; 
			color_foreground: number | null; 
		};
		targets: Array<string>;
		text: string;
	};
	PUBMSG: {
		formats: {
			format_bold: boolean;
			format_italic: boolean;
			format_underline: boolean;
		};
		colors: {
			color_background: number | null; 
			color_foreground: number | null; 
		};
		channels: Array<ChannelID>;
		text: string;
	};

	QUIT: {
		reason?: string;
	};

	SAJOIN: { channels: Array<ChannelID>; nicknames?: Array<string> };
	SAPART: {
		channels: Array<ChannelID>;
		nicknames: Array<string>;
		message?: string;
	};
	SILENCE: { nickname: string };

	TOPIC: { channel: ChannelID; topic?: string };
}

declare type CommandsNames = keyof Commands;
declare type Command<T extends keyof Commands> = Commands[T];
