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

import type { PrivateParticipant } from "../private/participant";
import type { PrivateRoom } from "../private/room";
import type { Layer, OverlayerStore } from "../store/overlayer";
import type { MenuInterface } from "./interface";

// ---- //
// Type //
// ---- //

export interface PrivateOptionsRecordMenu {
	// Privé actif
	room: PrivateRoom;
	// Le client courant
	currentClient: PrivateParticipant;
	// Est-ce que le client est authentifié
	isClientAuthenticated: boolean;
	// Participant destinataire de la conversation
	recipient: PrivateParticipant;
	// Est-ce que le participant est bloqué?
	isRecipientBlocked: boolean;
}

// -------------- //
// Implémentation //
// -------------- //

export class PrivateOptionsMenu
	implements MenuInterface<PrivateOptionsRecordMenu>
{
	// ------ //
	// Static //
	// ------ //

	static ID = "menu-private-options-layer";

	static create(
		overlayer_store: OverlayerStore,
		event: Event,
		record: PrivateOptionsRecordMenu,
	) {
		overlayer_store.create({
			id: PrivateOptionsMenu.ID,
			background_color: true,
			event,
			data: record,
		});

		return new PrivateOptionsMenu(overlayer_store);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayer_store: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayer_store.destroy(PrivateOptionsMenu.ID);
	}

	get(): Option<Layer<PrivateOptionsRecordMenu>> {
		return this.overlayer_store
			.get(PrivateOptionsMenu.ID)
			.as<Layer<PrivateOptionsRecordMenu>>();
	}

	get_unchecked(): Layer<PrivateOptionsRecordMenu> {
		return this.get().unwrap_unchecked();
	}

	exists(): boolean {
		return this.overlayer_store.has(PrivateOptionsMenu.ID);
	}

	with_data(data: PrivateOptionsRecordMenu) {
		this.overlayer_store.update_data(PrivateOptionsMenu.ID, data);
	}
}
