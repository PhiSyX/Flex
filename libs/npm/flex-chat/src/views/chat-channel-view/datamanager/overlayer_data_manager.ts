// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelSettingsRecordDialog } from "../../../dialogs/channel_settings";
import {
	ChannelOptionsMenu,
	type ChannelOptionsRecordMenu,
} from "../../../menu/channel_options";
import type { Layer, OverlayerStore } from "../../../store";

import { ChangeFormatsColorsDialog } from "../../../dialogs/change_formats_colors";
import { ChannelChangeTopicLayer } from "../../../dialogs/channel_change_topic";
import { ChannelSettingsDialog } from "../../../dialogs/channel_settings";
import { UserChangeNicknameDialog } from "../../../dialogs/user_change_nickname";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelOverlayerManager {
	constructor(private store: OverlayerStore) {}

	create_channel_options_menu(evt: Event, record: ChannelOptionsRecordMenu) {
		ChannelOptionsMenu.create(this.store, evt, record);
	}

	create_channel_settings_dialog(record: ChannelSettingsRecordDialog) {
		ChannelSettingsDialog.create(this.store, record);
	}

	create_colors_box(evt: Event) {
		ChangeFormatsColorsDialog.create(this.store, evt);
	}

	create_user_change_nickname_dialog(evt: Required<Layer["event"]>) {
		UserChangeNicknameDialog.create(this.store, evt);
	}

	create_topic_layer(
		event: Required<Layer["event"]>,
		linked_element: Required<Layer["dom_element"]>,
	) {
		ChannelChangeTopicLayer.create(this.store, event, linked_element);
	}

	destroy_topic_layer() {
		ChannelChangeTopicLayer.destroy(this.store);
	}
}
