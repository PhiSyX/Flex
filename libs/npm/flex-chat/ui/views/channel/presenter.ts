// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { RouterContract } from "@phisyx/flex-architecture/router";
import type { ChannelAccessLevelFlag } from "@phisyx/flex-chat/channel/access_level";
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelMemberSelected } from "@phisyx/flex-chat/channel/member/selected";
import type { ChannelRoom } from "@phisyx/flex-chat/channel/room";
import type { Layer } from "@phisyx/flex-chat/store";
import type { Option } from "@phisyx/flex-safety";
import type { ChannelInteractor } from "./interactor";
import type { ChannelView } from "./view";

import { NoticesCustomRoom } from "@phisyx/flex-chat/custom_room/notices";
import { assert_non_null, None } from "@phisyx/flex-safety";
import { ChannelRouter } from "./router";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelPresenter {
	constructor(router_acl: RouterContract, view: ChannelView) {
		this.router = new ChannelRouter(router_acl);
		this.view = view;
		this.view.presenter = this;
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<ChannelInteractor> = None();
	view: ChannelView;
	router: ChannelRouter;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): ChannelInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: ChannelInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	ban_mask(mask: MaskAddr) {
		assert_non_null(this.view.channel);
		return this.interactor.ban_mask(this.view.channel, mask);
	}
	unban_mask(mask: MaskAddr) {
		assert_non_null(this.view.channel);
		return this.interactor.unban_mask(this.view.channel, mask);
	}

	close() {
		assert_non_null(this.view.channel);
		return this.interactor.close(this.view.channel.name);
	}
	join() {
		assert_non_null(this.view.channel);
		return this.interactor.join(this.view.channel.name);
	}

	completion_list(): Array<string> {
		return this.interactor.get_all_commands(this.view.channel);
	}

	create_topic_layer(payload: {
		event: Required<Layer["event"]>;
		linked_element: Required<Layer["dom_element"]>;
	}) {
		this.interactor.create_topic_layer(
			payload.event,
			payload.linked_element,
		);
	}
	destroy_topic_layer() {
		this.interactor.destroy_topic_layer();
	}

	notice_room() {
		return this.interactor.find_by_name(
			NoticesCustomRoom.ID as unknown as ChannelID,
		);
	}

	open_channel_settings_dialog() {
		assert_non_null(this.view.channel);

		let channel_settings_record = {
			room: this.view.channel,
			view: this.view,
			currentClientChannelMember: this.view.current_client_channel_member,
		};

		this.interactor.create_channel_settings_dialog(channel_settings_record);
	}

	open_channel_options_menu(evt: Event) {
		assert_non_null(this.view.channel);

		let channel_options_record = {
			room: this.view.channel,
			currentClientChannelMember: this.view.current_client_channel_member,
		};
		this.interactor.create_channel_options_menu(
			evt,
			channel_options_record,
		);
	}

	open_colors_box(evt: Event) {
		this.interactor.create_colors_box(evt);
	}

	open_room(room_id: RoomID) {
		this.interactor.open_room(room_id);
	}

	open_private_or_create(origin: Origin) {
		this.interactor.open_private_or_create(origin);
	}

	open_user_change_nickname_dialog(evt: Required<Layer["event"]>) {
		this.interactor.create_user_change_nickname_dialog(evt);
	}

	get_channel_from_route(): Option<ChannelRoom> {
		return this.interactor.find_by_name(this.router.param_channelname());
	}

	get_current_member(): Option<ChannelMember> {
		assert_non_null(this.view.channel);
		let channel = this.view.channel;
		let user_id = this.interactor.get_current_client_id();
		return channel.get_member(user_id);
	}

	get_current_user_nickname(): string {
		return this.interactor.get_current_client_nickname();
	}

	get_selected_member_from(
		channel: ChannelRoom,
	): Option<ChannelMemberSelected> {
		return this.interactor.get_selected_member_from(channel);
	}

	layout_settings() {
		return this.interactor.layout_settings();
	}

	personalization_settings() {
		return this.interactor.personalization_settings();
	}

	select_member(origin: Origin) {
		assert_non_null(this.view.channel);
		this.interactor.select_member_from(this.view.channel, origin);
	}

	send(message: string) {
		assert_non_null(this.view.channel);
		this.interactor.send_to(this.view.channel.name, message);
	}

	set_access_level(
		channel: ChannelRoom,
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	) {
		this.interactor.set_access_level(channel, member, access_level_flag);
	}

	unset_access_level(
		channel: ChannelRoom,
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	) {
		this.interactor.unset_access_level(channel, member, access_level_flag);
	}

	ignore(nickname: Origin["nickname"]) {
		this.interactor.ignore(nickname);
	}
	unignore(nickname: Origin["nickname"]) {
		this.interactor.unignore(nickname);
	}

	kick(member: ChannelMember, comment?: string) {
		assert_non_null(this.view.channel);
		this.interactor.kick(this.view.channel, member, comment);
	}

	update_topic(topic: string) {
		assert_non_null(this.view.channel);
		this.interactor.update_topic(this.view.channel.name, topic);
	}
}
