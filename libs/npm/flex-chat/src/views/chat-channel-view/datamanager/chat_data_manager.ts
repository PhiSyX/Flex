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
import type { ChannelAccessLevelFlag } from "../../../channel/access_level";
import type { ChannelMember } from "../../../channel/member";
import type { ChannelMemberSelected } from "../../../channel/member/selected";
import type { ChannelRoom } from "../../../channel/room";
import type { ChatStoreInterface, ChatStoreInterfaceExt } from "../../../store";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelChatManager {
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	ban_mask(channel: ChannelRoom, mask: MaskAddr) {
		this.store.ban_channel_member_mask(channel, mask);
	}
	unban_mask(channel: ChannelRoom, mask: MaskAddr) {
		this.store.unban_channel_member_mask(channel, mask);
	}

	close(channel_name: ChannelID) {
		this.store.close_room(channel_name);
	}

	// TODO: ajouter ou demander la clé du salon
	join(channel_name: ChannelID) {
		let channel_key: string | undefined; // LIRE TODO ci-haut.
		this.store.join_channel(channel_name, channel_key);
	}

	get(channel_name: ChannelID): Option<ChannelRoom> {
		return this.store.room_manager().get(channel_name).as<ChannelRoom>();
	}

	get_all_commands(channel: ChannelRoom): Array<string> {
		return this.store.all_commands(channel);
	}

	get_current_client_id(): UserID {
		return this.store.client_id();
	}

	get_current_client_nickname(): string {
		return this.store.nickname();
	}

	get_selected_member_from(
		channel: ChannelRoom,
	): Option<ChannelMemberSelected> {
		return this.store.get_current_selected_channel_member(channel);
	}

	open_private_or_create(origin: Origin) {
		this.store.open_private_or_create(origin);
	}

	open_room(room_id: RoomID) {
		this.store.open_room(room_id);
	}

	select_member_from(channel: ChannelRoom, origin: Origin) {
		this.store.toggle_select_channel_member(channel, origin);
	}

	send_to(channel_name: ChannelID, message: string) {
		this.store.send_message(channel_name, message);
	}

	set_access_level(
		channel: ChannelRoom,
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	) {
		this.store.send_set_access_level(channel, member, access_level_flag);
	}

	unset_access_level(
		channel: ChannelRoom,
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	) {
		this.store.send_unset_access_level(channel, member, access_level_flag);
	}

	ignore(nickname: Origin["nickname"]) {
		this.store.ignore_user(nickname);
	}
	unignore(nickname: Origin["nickname"]) {
		this.store.unignore_user(nickname);
	}

	kick(channel: ChannelRoom, member: ChannelMember, comment?: string) {
		this.store.kick_channel_member(channel, member, comment);
	}

	update_topic(channel_name: ChannelID, topic: string) {
		this.store.update_topic(channel_name, topic);
	}
}
