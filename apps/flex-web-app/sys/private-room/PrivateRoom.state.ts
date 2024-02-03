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

import { PrivateNick } from "~/private/PrivateNick";
import { RoomMessage } from "~/room/RoomMessage";

// ---- //
// Type //
// ---- //

export interface Props {
	disableInput: boolean;
	inputHistory?: Array<string>;
	me: PrivateNick;
	currentNick: string;
	messages: Array<RoomMessage>;
	recipient: PrivateNick;
}

// ----------- //
// Local State //
// ----------- //

export const computeIsMe = (props: Props) => computed(() => props.me.partialEq(props.recipient));

export const computeTitleIgnoreButton = (props: Props) =>
	computed(() => {
		return props.disableInput
			? `Ne plus ignorer ${props.recipient.nickname}`
			: `Ignorer ${props.recipient.nickname}`;
	});
