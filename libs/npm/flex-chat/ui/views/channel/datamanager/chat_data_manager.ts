// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelMemberSelected } from "@phisyx/flex-chat/channel/member/selected";
import type { ChannelRoom } from "@phisyx/flex-chat/channel/room";
import type { CommandInterface } from "@phisyx/flex-chat/modules/interface";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store/chat";
import type { Option } from "@phisyx/flex-safety/option";

import { ChannelAccessLevelFlag } from "@phisyx/flex-chat/channel/access_level";
import { None } from "@phisyx/flex-safety/option";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelChatManager {
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	ban_mask(channel: ChannelRoom, mask: MaskAddr) {
		let module = this.store
			.module_manager()
			.get("BAN")
			.expect("Récupération du module `BAN`");
		module.send({ channels: [channel.name], masks: [mask] });
	}
	unban_mask(channel: ChannelRoom, mask: MaskAddr) {
		let module = this.store
			.module_manager()
			.get("UNBAN")
			.expect("Récupération du module `UNBAN`");
		module.send({ channels: [channel.name], masks: [mask] });
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
		let payload = { channel: channel.name, nicknames: [member.nickname] };

		let maybe_module: Option<CommandInterface<"OP">> = None();

		switch (access_level_flag) {
			case ChannelAccessLevelFlag.Owner:
				maybe_module = this.store.module_manager().get("QOP");
				break;
			case ChannelAccessLevelFlag.AdminOperator:
				maybe_module = this.store.module_manager().get("AOP");
				break;
			case ChannelAccessLevelFlag.Operator:
				maybe_module = this.store.module_manager().get("OP");
				break;
			case ChannelAccessLevelFlag.HalfOperator:
				maybe_module = this.store.module_manager().get("HOP");
				break;
			case ChannelAccessLevelFlag.Vip:
				maybe_module = this.store.module_manager().get("VIP");
				break;
		}

		let module = maybe_module.expect(
			`Récupération du module \`AccessLevel (${access_level_flag})\``,
		);

		module.send(payload);
	}

	unset_access_level(
		channel: ChannelRoom,
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	) {
		let payload = { channel: channel.name, nicknames: [member.nickname] };

		let maybe_module: Option<CommandInterface<"OP">> = None();

		switch (access_level_flag) {
			case ChannelAccessLevelFlag.Owner:
				maybe_module = this.store.module_manager().get("DEQOP");
				break;
			case ChannelAccessLevelFlag.AdminOperator:
				maybe_module = this.store.module_manager().get("DEAOP");
				break;
			case ChannelAccessLevelFlag.Operator:
				maybe_module = this.store.module_manager().get("DEOP");
				break;
			case ChannelAccessLevelFlag.HalfOperator:
				maybe_module = this.store.module_manager().get("DEHOP");
				break;
			case ChannelAccessLevelFlag.Vip:
				maybe_module = this.store.module_manager().get("DEVIP");
				break;
		}

		let module = maybe_module.expect(
			`Récupération du module \`AccessLevel (${access_level_flag})\``,
		);

		module?.send(payload);
	}

	ignore(nickname: Origin["nickname"]) {
		this.store.ignore_user(nickname);
	}
	unignore(nickname: Origin["nickname"]) {
		this.store.unignore_user(nickname);
	}

	kick(channel: ChannelRoom, member: ChannelMember, comment = "Kick.") {
		let module = this.store
			.module_manager()
			.get("KICK")
			.expect("Récupération du module `KICK`");
		module.send({
			channels: [channel.name],
			knicks: [member.nickname],
			comment,
		});
	}

	update_topic(channel_name: ChannelID, topic: string) {
		let module = this.store
			.module_manager()
			.get("TOPIC")
			.expect("Récupération du module `TOPIC`");
		module.send({ channel: channel_name, topic });
	}
}
