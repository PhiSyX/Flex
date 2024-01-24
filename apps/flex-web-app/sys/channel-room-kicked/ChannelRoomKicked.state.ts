// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { computed, ref, toRaw } from "vue";

import { RoomMessage } from "~/room/RoomMessage";

// ---- //
// Type //
// ---- //

export interface Props {
	lastMessage: RoomMessage;
}

// ----------- //
// Local State //
// ----------- //

export const displayJoinButton = ref(true);

// NOTE: Nous voulons récupérer le dernier événement du salon juste avant le
//       KICK, car il contient les données du KICK, mais pas les nouveaux
//       événements/messages qui pourraient être ajoutés. De nouveaux événements
//       peuvent être ajoutés au salon au fur & à mesure que le salon en état de
//       KICK mais actif. Exemple, Lorsqu'un utilisateur entre en contact avec
//       l'utilisateur qui a été KICK, l'événement "QUERY" est ajouté à la
//       chambre active.
export const toRawLastMessage = (props: Props) =>
	toRaw(props.lastMessage as RoomMessage & { data: GenericReply<"KICK"> });

export const computeNickname = (props: Props) =>
	computed(() => toRawLastMessage(props).data.origin.nickname);
export const computeChannel = (props: Props) =>
	computed(() => toRawLastMessage(props).data.channel);
export const computeReason = (props: Props) => computed(() => toRawLastMessage(props).data.reason);
