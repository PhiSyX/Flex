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

export interface UserChangeNicknameRecordDialog
{}

// -------------- //
// Implémentation //
// -------------- //

export class UserChangeNicknameDialog
{
	// ------ //
	// Static //
	// ------ //

	static ID = "user-change-nickname-dialog";

	static create(
		overlayer_store: OverlayerStore,
		{ event }: { event: MouseEvent },
	)
	{
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
	constructor(private overlayer_store: OverlayerStore)
	{}

	// ------- //
	// Méthode //
	// ------- //

	destroy()
	{
		this.overlayer_store.destroy(UserChangeNicknameDialog.ID);
	}

	get(): Layer<UserChangeNicknameRecordDialog> | undefined
	{
		return this.overlayer_store.get(UserChangeNicknameDialog.ID) as
			| Layer<UserChangeNicknameRecordDialog>
			| undefined;
	}

	get_unchecked(): Layer<UserChangeNicknameRecordDialog>
	{
		return this.overlayer_store.get(
			UserChangeNicknameDialog.ID,
		) as Layer<UserChangeNicknameRecordDialog>;
	}

	exists(): boolean
	{
		return this.overlayer_store.has(UserChangeNicknameDialog.ID);
	}

	with_data(data: UserChangeNicknameRecordDialog)
	{
		this.overlayer_store.update_data(UserChangeNicknameDialog.ID, data);
	}
}
