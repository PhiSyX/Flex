// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Option } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelTopic {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Sujet du salon.
	 */
	private text: Option<string> = None();

	/**
	 * État d'édition.
	 */
	private editable = true;

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Est-ce que le sujet du salon est éditable.
	 */
	isEditable(): boolean {
		return this.editable;
	}

	/**
	 * Sujet du salon.
	 */
	get(): string {
		return this.text.unwrap_or("");
	}

	/**
	 * Définit le sujet du salon.
	 */
	set(topic: string, options?: { force: boolean }) {
		if (this.editable || options?.force) {
			this.text.replace(topic);
		}
	}

	/**
	 * Définit l'état d'édition.
	 */
	setEditable(b: boolean) {
		this.editable = b;
	}

	/**
	 * Définit le sujet du salon à du vide.
	 */
	unset(options?: { force: boolean }) {
		if (this.editable || options?.force) {
			this.text = None();
		}
	}
}
