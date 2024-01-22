// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Props } from "./ChannelUserlistMenu.state";

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "open-private", user: Origin): void;
	(evtName: "ignore-user", user: Origin): void;
	(evtName: "unignore-user", user: Origin): void;
}

// -------- //
// Fonction //
// -------- //

export function openPrivate(emit: Emits, props: Props) {
	function openPrivateHandler() {
		emit("open-private", props.user.cnick);
	}
	return openPrivateHandler;
}

export function ignoreUser(emit: Emits, props: Props) {
	function ignoreUserHandler() {
		emit("ignore-user", props.user.cnick);
	}
	return ignoreUserHandler;
}

export function unignoreUser(emit: Emits, props: Props) {
	function unignoreUserHandler() {
		emit("unignore-user", props.user.cnick);
	}
	return unignoreUserHandler;
}
