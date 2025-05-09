// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ---- //
// Type //
// ---- //

export const ICON_NAMES = [
	"arrow-down",
	"arrow-left",
	"arrow-right",
	"arrow-up",
	"block-resize",
	"channel",
	"channel-list",
	"chat",
	"close",
	"dashboard",
	"ellipsis",
	"email",
	"error",
	"event",
	"home",
	"loader",
	"login",
	"logoff",
	"mention",
	"message",
	"messages",
	"notice",
	"password",
	"photo",
	"plus",
	"report",
	"send",
	"settings",
	"sound",
	"text-color",
	"url",
	"user",
	"user-block",
	"users",
	"view-list",
] as const;

export type Icons = (typeof ICON_NAMES)[number];
