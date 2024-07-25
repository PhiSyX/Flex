// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Layer, OverlayerStore } from "../store";

// ---- //
// Type //
// ---- //

export interface UserChangeNicknameRecordDialog {}

export class UserChangeNicknameDialog {
	// ------ //
	// Static //
	// ------ //

	static ID = "user-change-nickname-dialog";

	static create(
		overlayerStore: OverlayerStore,
		{ event }: { event: MouseEvent },
	) {
		overlayerStore.create({
			id: UserChangeNicknameDialog.ID,
			centered: true,
			event,
		});
		return new UserChangeNicknameDialog(overlayerStore);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayerStore: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayerStore.destroy(UserChangeNicknameDialog.ID);
	}

	get(): Layer<UserChangeNicknameRecordDialog> | undefined {
		return this.overlayerStore.get(UserChangeNicknameDialog.ID) as
			| Layer<UserChangeNicknameRecordDialog>
			| undefined;
	}

	getUnchecked(): Layer<UserChangeNicknameRecordDialog> {
		return this.overlayerStore.get(
			UserChangeNicknameDialog.ID,
		) as Layer<UserChangeNicknameRecordDialog>;
	}

	exists(): boolean {
		return this.overlayerStore.has(UserChangeNicknameDialog.ID);
	}

	withData(data: UserChangeNicknameRecordDialog) {
		this.overlayerStore.updateData(UserChangeNicknameDialog.ID, data);
	}
}
