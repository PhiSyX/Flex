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
import type { PrivateListInteractor } from "./interactor";
import type { PrivateListView } from "./view";

import { None } from "@phisyx/flex-safety/option";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateListPresenter {
	constructor(view: PrivateListView) {
		this.view = view;
		this.view.presenter = this;
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<PrivateListInteractor> = None();
	view: PrivateListView;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): PrivateListInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: PrivateListInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	get_privates_waiting() {
		return this.interactor.get_privates_waiting();
	}

	open_pending_private(priv: Origin) {
		this.interactor.open_pending_private(priv);
	}
}
