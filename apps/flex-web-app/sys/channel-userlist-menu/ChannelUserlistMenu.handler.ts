// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNick } from "~/channel/ChannelNick";
import { Props } from "./ChannelUserlistMenu.state";

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "ignore-user", user: Origin): void;
	(evtName: "kick-user", cnick: ChannelNick): void;
	(evtName: "open-private", user: Origin): void;
	(evtName: "set-access-level", cnick: ChannelNick, accessLevel: ChannelAccessLevel): void;
	(evtName: "unignore-user", user: Origin): void;
	(evtName: "unset-access-level", cnick: ChannelNick, accessLevel: ChannelAccessLevel): void;
}

// -------- //
// Fonction //
// -------- //

export function openPrivate(emit: Emits, props: Props) {
	function openPrivateHandler() {
		emit("open-private", props.user.cnick.intoUser());
	}
	return openPrivateHandler;
}

export function ignoreUser(emit: Emits, props: Props) {
	function ignoreUserHandler() {
		emit("ignore-user", props.user.cnick.intoUser());
	}
	return ignoreUserHandler;
}

export function kickUser(emit: Emits, props: Props) {
	function kickUserHandler() {
		emit("kick-user", props.user.cnick);
	}
	return kickUserHandler;
}

export function unignoreUser(emit: Emits, props: Props) {
	function unignoreUserHandler() {
		emit("unignore-user", props.user.cnick.intoUser());
	}
	return unignoreUserHandler;
}

export function setAccessLevel(emit: Emits) {
	function setAccessLevelHandler(cnick: ChannelNick, accessLevel: ChannelAccessLevel) {
		emit("set-access-level", cnick, accessLevel);
	}
	return setAccessLevelHandler;
}

export function unsetAccessLevel(emit: Emits) {
	function unsetAccessLevelHandler(cnick: ChannelNick, accessLevel: ChannelAccessLevel) {
		emit("unset-access-level", cnick, accessLevel);
	}
	return unsetAccessLevelHandler;
}
