// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { AlertEmits } from "./emits";

// ---- //
// Type //
// ---- //

export type AlertButtonFlags = number;

export interface AlertLabelButtons {
	/**
	 * Le libellé pour le bouton "cancel".
	 * @default DEFAULT_LABEL_CANCEL
	 */
	cancel?: string;

	/**
	 * Le libellé pour le bouton "no".
	 * @default DEFAULT_LABEL_NO
	 */
	no?: string;

	/**
	 * Le libellé pour le bouton "ok".
	 * @default DEFAULT_LABEL_OK
	 */
	ok?: string;

	/**
	 * Le libellé pour le bouton "yes".
	 * @default DEFAULT_LABEL_YES
	 */
	yes?: string;
}

export enum AlertButtonFlag {
	YES = 0x0001,
	NO = 0x0002,
	OK = 0x0004,
	CANCEL = 0x0008,
}

interface AlertButton {
	label: string;
	handler: () => void;
}

// -------- //
// Constant //
// -------- //

export const DEFAULT_LABEL_CANCEL = "Annuler";
export const DEFAULT_LABEL_NO = "Non";
export const DEFAULT_LABEL_OK = "Ok";
export const DEFAULT_LABEL_YES = "Oui";

// -------- //
// Fonction //
// -------- //

export function make_alert_buttons(
	buttons_flag: AlertButtonFlags,
	labels: Required<AlertLabelButtons>,
	emit: AlertEmits,
): Array<AlertButton> {
	if (!buttons_flag) {
		return [];
	}

	let buttons_temp: Array<AlertButton> = [];

	if (buttons_flag & AlertButtonFlag.YES) {
		buttons_temp.push({
			label: labels.yes,
			handler: () => emit("yes"),
		});
	}

	if (buttons_flag & AlertButtonFlag.NO) {
		buttons_temp.push({
			label: labels.no,
			handler: () => emit("no"),
		});
	}

	if (buttons_flag & AlertButtonFlag.OK) {
		buttons_temp.push({
			label: labels.ok,
			handler: () => emit("ok"),
		});
	}

	if (buttons_flag & AlertButtonFlag.CANCEL) {
		buttons_temp.push({
			label: labels.cancel,
			handler: () => emit("cancel"),
		});
	}

	return buttons_temp;
}
