// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { computed } from "vue";

// ---- //
// Type //
// ---- //

export interface Props<R extends RepliesNames> {
	data: GenericReply<R>;
	id: UUID;
	archived: boolean;
	formats?: {
		bold: boolean | null;
		italic: boolean | null;
		underline: boolean | null;
	};
	colors?: {
		background: number | null;
		foreground: number | null;
	};
	message: string;
	is_current_client: boolean;
	nickname: string;
	target: string;
	time: {
		datetime: string;
		formatted_time: string;
	};
	type:
		| "action"
		| `error:${string}`
		| "event"
		| `event:${string}`
		| "pubmsg"
		| "privmsg";
}

// ----------- //
// Local State //
// ----------- //

// INFO: hostname
export const computeHostname = (origin: Origin) =>
	computed(() => origin.host.vhost || origin.host.cloaked);

// INFO: ident@hostname
export const computeUserAddress = (origin: Origin) =>
	computed(() => `${origin.ident}@${computeHostname(origin)}`);

// INFO: nickname!ident@hostname
export const computeFullUserAddress = (origin: Origin) =>
	computed(() => `${origin.nickname}!${computeUserAddress(origin)}`);
