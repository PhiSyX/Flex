// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Option } from "@phisyx/flex-safety";
import { ref } from "vue";

import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelSelectedUser } from "~/channel/ChannelSelectedUser";
import { ChannelTopic } from "~/channel/ChannelTopic";
import { ChannelUsers } from "~/channel/ChannelUsers";
import { RoomMessage } from "~/room/RoomMessage";

// ---- //
// Type //
// ---- //

export interface Props {
	canEditTopic: boolean;
	disableInput: boolean;
	inputHistory?: Array<string>;
	me: Option<ChannelNick>;
	currentNick: string;
	messages: Array<RoomMessage>;
	name: string;
	selectedUser: Option<ChannelSelectedUser>;
	topic: ChannelTopic;
	users: ChannelUsers;
}

// ----------- //
// Local State //
// ----------- //

export const displayUserlist = ref(true);
