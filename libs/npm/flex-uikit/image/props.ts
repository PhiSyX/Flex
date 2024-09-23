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

export interface ImageProps {
	alt?: HTMLImageElement["alt"];
	/**
	 * Source de l'image. En cas d'échec de chargement, la propriété `fallback`
	 * est utilisé pour charger une par défaut.
	 */
	src: HTMLImageElement["src"];
	/**
	 * Fichier à charger à la place de la source.
	 */
	file?: File;
	/**
	 * Image à charger en cas d'échec.
	 *
	 * @default "/public/img/default-avatar.png"
	 */
	fallback?: string;
	/**
	 * Taille de l'image en nombre premier. Cette taille est calculée par un
	 * multiple de 8.
	 *
	 * @example size=4
	 * @output `props.size * 8 //?= 32`
	 */
	size?: string | number;
	/**
	 * Applique une bordure à l'image de 50%.
	 */
	rounded?: boolean;
	/**
	 * Applique le style `object-fit: cover;`.
	 */
	cover?: boolean;
	/**
	 * Rafraîchi la source de l'image toutes les `refreshTime` minutes.
	 *
	 * @default true
	 *
	 * @default refreshTime.PROD=30
	 * @default refreshTime.DEV=1
	 */
	refreshSrc?: boolean;
	/**
	 * Quand est-ce le rafraîchissement doit être fait. En **MINUTE**.
	 *
	 * @default PROD=30
	 * @default DEV=1
	 */
	refreshTime?: number;

	/**
	 * Mettre le text à droite de l'image.
	 */
	textInline?: boolean;
	/**
	 * Classes à ajouter à l'élément racine.
	 */
	rootClass?: unknown;
}
