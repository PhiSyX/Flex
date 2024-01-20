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
import { PrivateRoom } from "~/private/PrivateRoom";
import { useChatStore } from "~/store/ChatStore";

const chatStore = useChatStore();

// ---- //
// Type //
// ---- //

export interface Props {
	room: PrivateRoom;
}

// ----------- //
// Local State //
// ----------- //

export const computeMe = (props: Props) =>
	computed(() =>
		props.room.getParticipant(chatStore.store.clientID()).unwrap(),
	);
export const computeRecipient = (props: Props) =>
	computed(() => props.room.getParticipant(props.room.id()).unwrap());

export const computeRecipientIsBlocked = (nick: PrivateNick) =>
	computed(() => chatStore.checkUserIsBlocked(nick.intoUser()));
