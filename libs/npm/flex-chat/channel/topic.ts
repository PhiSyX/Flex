// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety/option";

import { None } from "@phisyx/flex-safety/option";

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

	/**
	 * Historique des sujets (en session)
	 */
	public history: Set<string> = new Set();

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Est-ce que le sujet du salon est éditable.
	 */
	is_editable(): boolean {
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
			this.history.delete(topic);
			this.history.add(topic);
			this.text.replace(topic);
		}
	}

	/**
	 * Définit l'état d'édition.
	 */
	set_editable(b: boolean) {
		this.editable = b;
	}

	/**
	 * Définit le sujet du salon à du vide.
	 */
	unset(options?: { force: boolean }) {
		if (this.editable || options?.force) {
			this.history.delete("");
			this.history.add("");
			this.text = None();
		}
	}
}
