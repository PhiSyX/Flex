// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/// <reference types="@phisyx/flex-css" />

declare const __opaque__: unique symbol;

declare type Opaque<B, R> = B & { readonly [__opaque__]: R };

declare type UUID = Opaque<
	`${string}-${string}-${string}-${string}-${string}`,
	"UUID"
>;
declare type ChannelID = Opaque<string, "ChannelID">;
declare type UserID = Opaque<
	`${string}-${string}-${string}-${string}-${string}`,
	"UserID"
>;
declare type CustomRoomID = Opaque<`@${string}`, "CustomRoomID">;
declare type RoomID = ChannelID | UserID | CustomRoomID;
declare type MaskAddr = Opaque<`${string}!${string}@${string}`, "MaskAddr">;
