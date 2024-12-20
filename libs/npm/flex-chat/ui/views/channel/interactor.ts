// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelAccessLevelFlag } from "@phisyx/flex-chat/channel/access_level";
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelMemberSelected } from "@phisyx/flex-chat/channel/member/selected";
import type { ChannelRoom } from "@phisyx/flex-chat/channel/room";
import type { ChannelSettingsRecordDialog } from "@phisyx/flex-chat/dialogs/channel_settings";
import type { ChannelOptionsRecordMenu } from "@phisyx/flex-chat/menu/channel_options";
import type { Layer } from "@phisyx/flex-chat/store/overlayer";
import type { Option } from "@phisyx/flex-safety/option";
import type { ChannelChatManager } from "./datamanager/chat_data_manager";
import type { ChannelOverlayerManager } from "./datamanager/overlayer_data_manager";
import type { ChannelSettingsManager } from "./datamanager/settings_data_manager";
import type { ChannelPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelInteractor {
	constructor(
		presenter: ChannelPresenter,
		datamanager: [
			chat: ChannelChatManager,
			overlayer: ChannelOverlayerManager,
			settings: ChannelSettingsManager,
		],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
		this.overlayer_manager = datamanager[1];
		this.settings_manager = datamanager[2];
	}

	// --------- //
	// Propriété //
	// --------- //

	presenter: ChannelPresenter;

	private chat_manager!: ChannelChatManager;
	private overlayer_manager!: ChannelOverlayerManager;
	private settings_manager!: ChannelSettingsManager;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	ban_mask(channel: ChannelRoom, mask: MaskAddr) {
		this.chat_manager.ban_mask(channel, mask);
	}
	unban_mask(channel: ChannelRoom, mask: MaskAddr) {
		this.chat_manager.unban_mask(channel, mask);
	}

	create_channel_options_menu(evt: Event, record: ChannelOptionsRecordMenu) {
		this.overlayer_manager.create_channel_options_menu(evt, record);
	}

	create_channel_settings_dialog(record: ChannelSettingsRecordDialog) {
		this.overlayer_manager.create_channel_settings_dialog(record);
	}

	create_colors_box(evt: Event) {
		this.overlayer_manager.create_colors_box(evt);
	}

	create_user_change_nickname_dialog(event: Required<Layer["event"]>) {
		this.overlayer_manager.create_user_change_nickname_dialog(event);
	}

	create_topic_layer(
		event: Required<Layer["event"]>,
		linked_element: Required<Layer["dom_element"]>,
	) {
		this.overlayer_manager.create_topic_layer(event, linked_element);
	}
	destroy_topic_layer() {
		this.overlayer_manager.destroy_topic_layer();
	}

	close(name: ChannelID) {
		this.chat_manager.close(name);
	}
	join(name: ChannelID) {
		this.chat_manager.join(name);
	}

	get_all_commands(channel: ChannelRoom): Array<string> {
		return this.chat_manager.get_all_commands(channel);
	}

	find_by_name(name: ChannelID): Option<ChannelRoom> {
		return this.chat_manager.get(name);
	}

	get_current_client_id(): UserID {
		return this.chat_manager.get_current_client_id();
	}

	get_current_client_nickname(): string {
		return this.chat_manager.get_current_client_nickname();
	}

	get_selected_member_from(
		channel: ChannelRoom,
	): Option<ChannelMemberSelected> {
		return this.chat_manager.get_selected_member_from(channel);
	}

	layout_settings() {
		return this.settings_manager.layout_settings();
	}

	personalization_settings() {
		return this.settings_manager.personalization_settings();
	}

	open_private_or_create(origin: Origin) {
		this.chat_manager.open_private_or_create(origin);
	}

	open_room(room_id: RoomID) {
		this.chat_manager.open_room(room_id);
	}

	select_member_from(channel: ChannelRoom, origin: Origin) {
		this.chat_manager.select_member_from(channel, origin);
	}

	send_to(channel_name: ChannelID, message: string) {
		this.chat_manager.send_to(channel_name, message);
	}

	set_access_level(
		channel: ChannelRoom,
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	) {
		this.chat_manager.set_access_level(channel, member, access_level_flag);
	}

	unset_access_level(
		channel: ChannelRoom,
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	) {
		this.chat_manager.unset_access_level(
			channel,
			member,
			access_level_flag,
		);
	}

	ignore(nickname: Origin["nickname"]) {
		this.chat_manager.ignore(nickname);
	}
	unignore(nickname: Origin["nickname"]) {
		this.chat_manager.unignore(nickname);
	}

	kick(channel: ChannelRoom, member: ChannelMember, comment?: string) {
		this.chat_manager.kick(channel, member, comment);
	}

	update_topic(channel_name: ChannelID, topic: string) {
		this.chat_manager.update_topic(channel_name, topic);
	}
}
