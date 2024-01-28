// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { fuzzy_search } from "@phisyx/flex-search";
import { computed, ref } from "vue";
import { ChannelListCustomRoom } from "~/custom-room/ChannelListCustomRoom";

// ---- //
// Type //
// ---- //

export interface Props {
	room: ChannelListCustomRoom;
}

// ----------- //
// Local State //
// ----------- //

export const filteredChannelInput = ref("");
export const selectedChannels = ref(new Set<string>());

export const computeFilteredChannels = (props: Props) =>
	computed(() => {
		if (filteredChannelInput.value.length === 0) {
			return props.room.channels;
		}
		return Array.from(props.room.channels).filter((channel) =>
			fuzzy_search(filteredChannelInput.value, channel[0]).is_some(),
		);
	});
