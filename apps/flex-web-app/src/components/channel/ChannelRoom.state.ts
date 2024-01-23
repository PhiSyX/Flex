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
import { ChannelRoom } from "~/channel/ChannelRoom";
import { useChatStore } from "~/store/ChatStore";

const chatStore = useChatStore();

// ---- //
// Type //
// ---- //

export interface Props {
	room: ChannelRoom;
}

// ----------- //
// Local State //
// ----------- //

// NOTE: retourne une Option, car l'utilisateur courant PEUT être sanctionné à
// tout moment.
export const compute$me = (props: Props) =>
	computed(() => props.room.getUser(chatStore.store.me().id));

export const computeCanEditTopic = (props: Props) =>
	computed(() =>
		compute$me(props)
			.value.map((cnick) => props.room.canEditTopic(cnick))
			.unwrap_or(false),
	);

export const computeSelectedUser = (props: Props) =>
	computed(() => chatStore.getSelectedUser(props.room));
