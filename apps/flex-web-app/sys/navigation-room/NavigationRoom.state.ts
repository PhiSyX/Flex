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

/**
 * Est-ce qu'il y un total des événements non lus supérieur à zéro.
 */
export const computeHasUnreadEvents = ({
	totalUnreadEvents,
}: {
	totalUnreadEvents: number | undefined;
}) => {
	return computed(() => (totalUnreadEvents || 0) > 0);
};

/**
 * Est-ce qu'il y un total des messages non lus supérieur à zéro.
 */
export const computeHasUnreadMessages = ({
	totalUnreadMessages,
}: {
	totalUnreadMessages: number | undefined;
}) => {
	return computed(() => (totalUnreadMessages || 0) > 0);
};

/**
 * Nombre total des messages ou des événements reçus.
 */
export const computeTotalUnread = ({
	totalUnreadEvents,
	totalUnreadMessages,
}: {
	totalUnreadEvents: number | undefined;
	totalUnreadMessages: number | undefined;
}) =>
	computed(() => {
		// FIXME
		// return toUserFriendly(
		// 	totalUnreadMessages || totalUnreadEvents || 0
		// );
		return totalUnreadMessages || totalUnreadEvents || 0;
	});
