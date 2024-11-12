// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import {
	ChannelSettingsDialog,
	type ChannelSettingsRecordDialog,
} from "@phisyx/flex-chat/dialogs/channel_settings";
import {
	ChannelOptionsMenu,
	type ChannelOptionsRecordMenu,
} from "@phisyx/flex-chat/menu/channel_options";
import { UserChangeNicknameDialog } from "@phisyx/flex-chat/dialogs/user_change_nickname";
import { ChangeFormatsColorsDialog } from "@phisyx/flex-chat/dialogs/change_formats_colors";
import type { Layer, OverlayerStore } from "@phisyx/flex-chat/store/overlayer";

import { ChannelChangeTopicLayer } from "@phisyx/flex-chat/layers/channel_change_topic";

// -------------- //
// Implémentation //
// -------------- //

export class CustomRoomServerOverlayerManager {
	constructor(private store: OverlayerStore) {}

	create_channel_options_menu(evt: Event, record: ChannelOptionsRecordMenu) {
		this.store.create({
			id: ChannelOptionsMenu.ID,
			background_color: true,
			event: evt,
			data: record,
		});
	}

	create_channel_settings_dialog(record: ChannelSettingsRecordDialog) {
		this.store.create({
			id: ChannelSettingsDialog.ID,
			destroyable: "manual",
			centered: true,
			data: record,
		});
	}

	create_colors_box(evt: Event) {
		this.store.create({
			id: ChangeFormatsColorsDialog.ID,
			event: evt,
		});
	}

	create_user_change_nickname_dialog(evt: Required<Layer["event"]>) {
		this.store.create({
			id: UserChangeNicknameDialog.ID,
			centered: true,
			event: evt,
		});
	}

	create_topic_layer(
		evt: Required<Layer["event"]>,
		linked_element: Required<Layer["dom_element"]>,
	) {
		this.store.create({
			id: ChannelChangeTopicLayer.ID,
			destroyable: "manual",
			event: evt,
			dom_element: linked_element,
			trap_focus: false,
		});
	}

	destroy_topic_layer() {
		this.store.destroy(ChannelChangeTopicLayer.ID);
	}
}
