// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { PrivateParticipant } from "../../../private/participant";
import type { Layer, OverlayerStore } from "../../../store";

import { ChangeFormatsColorsDialog } from "../../../dialogs/change_formats_colors";
import { PrivatePendingRequestDialog } from "../../../dialogs/private_pending_request";
import { UserChangeNicknameDialog } from "../../../dialogs/user_change_nickname";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateOverlayerManager {
	constructor(private store: OverlayerStore) {}

	create_colors_box(evt: Event) {
		ChangeFormatsColorsDialog.create(this.store, evt);
	}

	create_private_pending_request_dialog(participant: PrivateParticipant) {
		PrivatePendingRequestDialog.create(this.store, participant);
	}

	destroy_private_pending_request_dialog() {
		PrivatePendingRequestDialog.destroy(this.store);
	}

	create_user_change_nickname_dialog(evt: Required<Layer["event"]>) {
		UserChangeNicknameDialog.create(this.store, evt);
	}
}
