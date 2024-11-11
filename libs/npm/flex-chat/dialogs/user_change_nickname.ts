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

import type { Layer, OverlayerStore } from "../store";
import type { DialogInterface } from "./interface";

// ---- //
// Type //
// ---- //

// -------------- //
// Implémentation //
// -------------- //

export class UserChangeNicknameDialog implements DialogInterface {
	// ------ //
	// Static //
	// ------ //

	static ID = "user-change-nickname-dialog";

	static create(
		overlayer_store: OverlayerStore,
		event: Required<Layer["event"]>,
	) {
		overlayer_store.create({
			id: UserChangeNicknameDialog.ID,
			centered: true,
			event,
		});
		return new UserChangeNicknameDialog(overlayer_store);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayer_store: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayer_store.destroy(UserChangeNicknameDialog.ID);
	}

	get(): Option<Layer> {
		return this.overlayer_store
			.get(UserChangeNicknameDialog.ID)
			.as<Layer>();
	}

	get_unchecked(): Layer {
		return this.get().unwrap_unchecked();
	}

	exists(): boolean {
		return this.overlayer_store.has(UserChangeNicknameDialog.ID);
	}
}
