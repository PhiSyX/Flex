// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assert_non_null } from "@phisyx/flex-safety";
import { $root, containerNeedsScroll } from "./RoomHistoryLogs.state";

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "select-nick", nickname: string): void;
}

// -------- //
// Fonction //
// -------- //

function scrollToBottom() {
	if (containerNeedsScroll.value) scroll();
}

export function scroll() {
	assert_non_null($root.value);
	$root.value.scrollTop = $root.value.scrollHeight;
}

// -------- //
// Handlers //
// -------- //

export function selectNick(emit: Emits) {
	function selectNickHandler(nickname: string) {
		emit("select-nick", nickname);
	}

	return selectNickHandler;
}

export function scrollHandler() {
	assert_non_null($root.value);
	containerNeedsScroll.value =
		$root.value.clientHeight + $root.value.scrollTop + 50 >=
		$root.value.scrollHeight;
	scrollToBottom();
}
