// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { selectedChannels } from "./ChannelList.state";

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "join-channel", name: string): void;
	(evtName: "channel-create-request", event: MouseEvent): void;
}

// -------- //
// Handlers //
// -------- //

export function joinSelectedChannels(emit: Emits) {
	function joinSelectedChannelsHandler() {
		for (const channel of selectedChannels.value) {
			emit("join-channel", channel);
		}
	}
	return joinSelectedChannelsHandler;
}

export function requestCreateChannel(emit: Emits) {
	function requestCreateChannelHandler(event: MouseEvent) {
		emit("channel-create-request", event);
	}
	return requestCreateChannelHandler;
}
