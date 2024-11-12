// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { PrivateOptionsRecordMenu } from "@phisyx/flex-chat/menu/private_options";
import type { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import type { Layer, OverlayerStore } from "@phisyx/flex-chat/store/overlayer";

import { ChangeFormatsColorsDialog } from "@phisyx/flex-chat/dialogs/change_formats_colors";
import { PrivatePendingRequestDialog } from "@phisyx/flex-chat/dialogs/private_pending_request";
import { UserChangeNicknameDialog } from "@phisyx/flex-chat/dialogs/user_change_nickname";
import { PrivateOptionsMenu } from "@phisyx/flex-chat/menu/private_options";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateOverlayerManager {
	constructor(private store: OverlayerStore) {}

	create_colors_box(evt: Event) {
		this.store.create({
			id: ChangeFormatsColorsDialog.ID,
			event: evt,
		});
	}

	create_private_pending_request_dialog(participant: PrivateParticipant) {
		let $nav = document.querySelector(".navigation-area") as HTMLElement;

		this.store.create({
			id: PrivatePendingRequestDialog.ID,
			centered: true,
			destroyable: "manual",
			dom_element: $nav,
			data: participant,
		});
	}

	destroy_private_pending_request_dialog() {
		this.store.destroy(PrivatePendingRequestDialog.ID);
	}

	create_user_change_nickname_dialog(evt: Required<Layer["event"]>) {
		this.store.create({
			id: UserChangeNicknameDialog.ID,
			centered: true,
			event: evt,
		});
	}

	create_private_options_menu(
		evt: Required<Layer["event"]>,
		record: PrivateOptionsRecordMenu,
	) {
		this.store.create({
			id: PrivateOptionsMenu.ID,
			event: evt,
			data: record,
		});
	}
}
