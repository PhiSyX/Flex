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
import type { PrivateListPresenter } from "./presenter";

import { None } from "@phisyx/flex-safety/option";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateListView {
	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<PrivateListPresenter> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): PrivateListPresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: PrivateListPresenter) {
		this.presenter_ref.replace($1);
	}

	/**
	 * Les privés en attente.
	 */
	get privates_waiting() {
		return this.presenter.get_privates_waiting();
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //

	open_pending_private_handler = (priv: Origin) => {
		this.presenter.open_pending_private(priv);
	};
}
