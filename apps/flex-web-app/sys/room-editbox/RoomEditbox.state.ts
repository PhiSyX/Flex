// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { computed, ref } from "vue";

// ---- //
// Type //
// ---- //

export interface Props {
	completionList?: Array<string>;
	nick: string;
	disableInput?: boolean;
	history?: Array<string>;
	// TODO: possibilité d'envoyer des messages avec des couleurs/mises en formes
	//background: color;
	//foreground: color;
	placeholder?: string;
	target: string;
}

// ----------- //
// Local State //
// ----------- //

export const $input = ref<HTMLInputElement>();
export const inputModel = ref("");

export const computeFormAction = (props: Props) =>
	computed(() => {
		const targetPath = props.target.startsWith("#")
			? `%23${props.target.slice(1).toLowerCase()}`
			: props.target.toLowerCase();
		return `/msg/${targetPath}`;
	});
