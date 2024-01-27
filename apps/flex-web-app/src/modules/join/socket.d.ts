// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

declare interface JoinFormData {
	channels: Array<string>;
	keys?: Array<string>;
}

declare interface SajoinFormData {
	nicknames?: Array<string>;
	channels: Array<string>;
}

declare interface JoinDataResponse {
	channel: string;
	forced: boolean;
}

declare interface Commands {
	JOIN: JoinFormData;
	SAJOIN: SajoinFormData;
}

declare interface CommandResponsesFromServer {
	JOIN: JoinDataResponse;
}

declare interface CommandResponsesReplies {
	// NOTE: ne retourne rien de particulier.
	// biome-ignore lint/complexity/noBannedTypes: ?
	RPL_ENDOFNAMES: {};

	RPL_NAMREPLY: {
		channel: string;
		code: number;
		users: Array<ChannelOrigin>;
	};
}

declare interface ErrorReplies {
	ERR_BADCHANNELKEY: { channel: string };
}
