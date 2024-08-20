// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";

import type { PrivateParticipant } from "../private/participant";
import type { Layer, OverlayerStore } from "../store";
import type { DialogInterface } from "./interface";

// ---- //
// Type //
// ---- //

export type PrivatePendingRequestRecordDialog = PrivateParticipant;

// -------------- //
// Implémentation //
// -------------- //

export class PrivatePendingRequestDialog implements DialogInterface<PrivatePendingRequestRecordDialog>
{
	// ------ //
	// Static //
	// ------ //

	static ID = "private-pending-request-layer";

	static create(
		overlayer_store: OverlayerStore,
		participant: PrivateParticipant,
	)
	{
		let $nav = document.querySelector(".navigation-area ") as HTMLElement;

		overlayer_store.create({
			id: PrivatePendingRequestDialog.ID,
			centered: true,
			destroyable: "manual",
			dom_element: $nav,
			data: participant,
		});

		return new PrivatePendingRequestDialog(overlayer_store);
	}

	static destroy(overlayer_store: OverlayerStore)
	{
		overlayer_store.destroy(PrivatePendingRequestDialog.ID);
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
		this.overlayer_store.destroy(PrivatePendingRequestDialog.ID);
	}

	get(): Option<Layer<PrivatePendingRequestRecordDialog>>
	{
		return this.overlayer_store.get(PrivatePendingRequestDialog.ID)
			.as<Layer<PrivatePendingRequestRecordDialog>>();
	}

	get_unchecked(): Layer<PrivatePendingRequestRecordDialog>
	{
		return this.get().unwrap_unchecked();
	}

	exists(): boolean
	{
		return this.overlayer_store.has(PrivatePendingRequestDialog.ID);
	}
}
