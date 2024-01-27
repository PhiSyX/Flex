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
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelSelectedUser } from "~/channel/ChannelSelectedUser";
import { UserFlag } from "~/user/User";

// ---- //
// Type //
// ---- //

export interface Props {
	disabled?: boolean;
	me: ChannelNick;
	user: ChannelSelectedUser;
}

// ----------- //
// Local State //
// ----------- //

export const computeIsMe = (props: Props) => computed(() => props.me.partialEq(props.user.cnick));

export const computeImGlobalOperator = (props: Props) =>
	computed(() =>
		props.me
			.intoUser()
			.operator.filter((flag) => flag === UserFlag.GlobalOperator)
			.is_some(),
	);

export const computeIHaveAccessLevel = (props: Props) =>
	computed(() => props.me.highestAccessLevel.level > ChannelAccessLevel.Vip);
