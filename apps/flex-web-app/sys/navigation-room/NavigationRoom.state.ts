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

// ---- //
// Type //
// ---- //

export interface Props {
	active: boolean;
	name: string;
	folded?: boolean;
	highlight?: boolean;
	totalUnreadEvents?: number;
	totalUnreadMessages?: number;
}

// ----------- //
// Local State //
// ----------- //

/**
 * Est-ce qu'il y un total des événements non lus supérieur à zéro.
 */
export const computeHasUnreadEvents = (props: Props) => {
	return computed(() => (props.totalUnreadEvents || 0) > 0);
};

/**
 * Est-ce qu'il y un total des messages non lus supérieur à zéro.
 */
export const computeHasUnreadMessages = (props: Props) => {
	return computed(() => (props.totalUnreadMessages || 0) > 0);
};

/**
 * Nombre total des messages ou des événements reçus.
 */
export const computeTotalUnread = (props: Props) =>
	computed(() => {
		// FIXME
		// return toUserFriendly(
		// 	totalUnreadMessages || totalUnreadEvents || 0
		// );
		return props.totalUnreadMessages || props.totalUnreadEvents || 0;
	});
