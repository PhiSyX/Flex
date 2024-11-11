// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { AlignX } from "../align";
import type { Icons } from "../icons";

// ---- //
// Type //
// ---- //

export interface ButtonIconProps {
	icon: Icons;
	attrs?: object;
}

export interface ButtonProps {
	/**
	 * Apparence du bouton.
	 * @default undefined
	 */
	appearance?: "primary" | "secondary" | "danger";

	/**
	 * Icône associé au bouton.
	 * @default undefined
	 */
	icon?: Icons;
	/**
	 * Attributs de l'icône.
	 */
	iconAttrs?: object;
	/**
	 * Position de l'icône.
	 * @default left
	 */
	iconPosition?: AlignX;

	/**
	 * Mettre de l'opacité sur le bouton.
	 * @default true
	 */
	withOpacity?: boolean;

	/**
	 * Valeur par défaut.
	 * @default undefined
	 */
	value?: unknown;
	/**
	 * Valeur associée à la valeur `true`.
	 * @default undefined
	 */
	trueValue?: unknown;
	/**
	 * Valeur associée à la valeur `false`.
	 * @default undefined
	 */
	falseValue?: unknown;

	/**
	 * État du bouton sélectionné.
	 * @default undefined
	 */
	selected?: unknown;

	/**
	 * Type de bouton.
	 * @default button
	 */
	type?: "submit" | "reset" | "cancel" | "button" | "dialog";
}
