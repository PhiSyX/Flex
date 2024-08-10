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

export interface ChangeFormatsColorsRecordDialog
{}

// -------------- //
// Implémentation //
// -------------- //

export class ChangeFormatsColorsDialog
{
	// ------ //
	// Static //
	// ------ //

	static ID = "change-formats-colors-dialog";

	static create(
		overlayer_store: OverlayerStore,
		{ event }: { event: MouseEvent },
	)
	{
		overlayer_store.create({
			id: ChangeFormatsColorsDialog.ID,
			centered: true,
			event,
		});
		return new ChangeFormatsColorsDialog(overlayer_store);
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
		this.overlayer_store.destroy(ChangeFormatsColorsDialog.ID);
	}

	get(): Layer<ChangeFormatsColorsRecordDialog> | undefined
	{
		return this.overlayer_store.get(ChangeFormatsColorsDialog.ID) as
			| Layer<ChangeFormatsColorsRecordDialog>
			| undefined;
	}

	get_unchecked(): Layer<ChangeFormatsColorsRecordDialog>
	{
		return this.overlayer_store.get(
			ChangeFormatsColorsDialog.ID,
		) as Layer<ChangeFormatsColorsRecordDialog>;
	}

	exists(): boolean
	{
		return this.overlayer_store.has(ChangeFormatsColorsDialog.ID);
	}

	with_data(data: ChangeFormatsColorsRecordDialog)
	{
		this.overlayer_store.update_data(ChangeFormatsColorsDialog.ID, data);
	}
}
