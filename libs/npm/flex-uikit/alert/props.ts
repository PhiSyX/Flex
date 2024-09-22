// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { TextAlign } from "../align";
import type { AlertButtonFlags, AlertLabelButtons } from "./buttons";
import type { AlertTypes } from "./types";

export interface AlertProps {
	/**
	 * Boutons à afficher en dessous du contenu.
	 * @default undefined
	 */
	buttons?: AlertButtonFlags;
	/**
	 * Les libellés des boutons en référence à la propriété `buttons`.
	 */
	buttonLabels?: AlertLabelButtons;
	/**
	 * Mettre les boutons sous formes de barre.
	 * @default true
	 */
	buttonsBar?: boolean;

	/**
	 * Affiche un bouton de fermeture.
	 * @default true
	 */
	closable?: boolean;
	/**
	 * Auto-destruction du composant après le montage du composant après le
	 * nombre de secondes définies.
	 * @default undefined
	 */
	closeAfterSeconds?: number;

	/**
	 * Alignement du contenu.
	 * @default "left"
	 */
	contentAlign?: TextAlign;

	/**
	 * Le type de l'alerte
	 */
	type: AlertTypes;
}
