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

import type { Layer, OverlayerStore } from "../store/overlayer";
import type { UserSession } from "../user/session";
import type { DialogInterface } from "./interface";

// ---- //
// Type //
// ---- //

export type UpdateAccountRecordDialog = UserSession;

// -------------- //
// Implémentation //
// -------------- //

export class UpdateAccountDialog
	implements DialogInterface<UpdateAccountRecordDialog>
{
	// ------ //
	// Static //
	// ------ //

	static ID = "update-account-layer";

	static create(
		overlayer_store: OverlayerStore,
		session: UpdateAccountRecordDialog,
	) {
		overlayer_store.create({
			id: UpdateAccountDialog.ID,
			centered: true,
			data: session,
		});

		return new UpdateAccountDialog(overlayer_store);
	}

	static destroy(overlayer_store: OverlayerStore) {
		overlayer_store.destroy(UpdateAccountDialog.ID);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayer_store: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayer_store.destroy(UpdateAccountDialog.ID);
	}

	get(): Option<Layer<UpdateAccountRecordDialog>> {
		return this.overlayer_store
			.get(UpdateAccountDialog.ID)
			.as<Layer<UpdateAccountRecordDialog>>();
	}

	get_unchecked(): Layer<UpdateAccountRecordDialog> {
		return this.get().unwrap_unchecked();
	}

	exists(): boolean {
		return this.overlayer_store.has(UpdateAccountDialog.ID);
	}
}
