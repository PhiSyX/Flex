// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{ChannelAccessLevel, ChannelMember, MemberInterface};
use flex_chat_client::{ClientServerApplicationInterface, ClientSocketInterface, Socket};
use flex_chat_client_channel::{
	ChannelClientSocketCommandResponse,
	ChannelClientSocketErrorReplies,
};
use flex_chat_client_nick::NickClientSocketErrorReplies;
use flex_chat_mode::ApplyMode;
use flex_chat_user::UserInterface;
use flex_web_framework::types::time;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::mode::{
	AccessLevelAdminOperatorCommandFormData,
	AccessLevelHalfOperatorCommandFormData,
	AccessLevelOperatorCommandFormData,
	AccessLevelOwnerOperatorCommandFormData,
	AccessLevelVipCommandFormData,
	ChannelMemberDTO,
	ModeAccessLevelClientSocketInterface,
};
use crate::features::chat::{ModeChannelAccessLevelApplicationInterface, OperApplicationInterface};
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

struct ModeChannelAccessLevelHandler;

pub struct ModeChannelAccessLevelQOPHandler;
pub struct ModeChannelAccessLevelAOPHandler;
pub struct ModeChannelAccessLevelOPHandler;
pub struct ModeChannelAccessLevelHOPHandler;
pub struct ModeChannelAccessLevelVIPHandler;

// -------------- //
// Implémentation //
// -------------- //

impl ModeChannelAccessLevelHandler
{
	fn update_member_access_level(
		socket: &SocketRef,
		app: &ChatApplication,
		channel_name: &str,
		nicknames: &[String],
		min_access_level: ChannelAccessLevel,
		set_access_level: ChannelAccessLevel,
	)
	{
		let client_socket = app.current_client(socket);

		if
			!app.is_client_global_operator(&client_socket) &&
			!app.does_client_have_rights_on_channel(
				&client_socket,
				channel_name,
				min_access_level,
			)
		{
			return;
		}

		let updated: Vec<_> = nicknames
			.iter()
			.filter_map(|nickname| {
				let Some(target_client_socket) = app.find_socket_by_nickname(client_socket.socket(), nickname) else {
					client_socket.send_err_nosuchnick(nickname);
					return None;
				};

				app.update_member_access_level_on_channel(
					&target_client_socket,
					channel_name,
					set_access_level,
				)
				.map(|member| {
					struct TargetMember<'a>
					{
						client: Socket<'a>,
						member: ChannelMember,
					}

					let join_room = |access_level: ChannelAccessLevel| {
						_ = target_client_socket.socket().join(format!(
							"channel:{}{}",
							access_level.symbol(),
							channel_name.to_lowercase(),
						));
					};

					// TODO: à améliorer/mieux réfléchir cette partie de code
					match set_access_level {
						| ChannelAccessLevel::Owner => {
							join_room(ChannelAccessLevel::Owner);
							join_room(ChannelAccessLevel::AdminOperator);
							join_room(ChannelAccessLevel::Operator);
							join_room(ChannelAccessLevel::HalfOperator);
							join_room(ChannelAccessLevel::Vip);
						}
						| ChannelAccessLevel::AdminOperator => {
							join_room(ChannelAccessLevel::AdminOperator);
							join_room(ChannelAccessLevel::Operator);
							join_room(ChannelAccessLevel::HalfOperator);
							join_room(ChannelAccessLevel::Vip);
						}
						| ChannelAccessLevel::Operator => {
							join_room(ChannelAccessLevel::Operator);
							join_room(ChannelAccessLevel::HalfOperator);
							join_room(ChannelAccessLevel::Vip);
						}
						| ChannelAccessLevel::HalfOperator => {
							join_room(ChannelAccessLevel::HalfOperator);
							join_room(ChannelAccessLevel::Vip);
						}
						| ChannelAccessLevel::Vip => {
							join_room(ChannelAccessLevel::Vip);
						}
					}

					TargetMember {
						client: target_client_socket,
						member,
					}
				})
			})
			.collect();

		if updated.is_empty() {
			return;
		}

		let Some(channel) = app.get_channel(channel_name) else {
			client_socket.send_err_notonchannel(channel_name);
			return;
		};

		let added_flags: Vec<_> = updated
			.iter()
			.map(|target_member| {
				let member = ChannelMemberDTO::from((target_member.client.client(), &target_member.member));
				(
					set_access_level.letter(),
					ApplyMode {
						flag: set_access_level,
						args: vec![member.user.nickname().to_owned()],
						updated_at: time::Utc::now(),
						updated_by: client_socket.user().nickname().to_owned(),
					},
				)
			})
			.collect();

		client_socket.emit_mode_access_level(&channel, &added_flags, &[], true);

		client_socket.send_rpl_namreply(&channel, move |member| {
			let found = updated.iter().find(|target_member| target_member.member.id() == member.id())?;
			let found_client = app.get_client_by_id(found.member.id())?;
			Some(ChannelMemberDTO::from((found_client, &found.member)))
		});
	}

	fn remove_member_access_level(
		socket: &SocketRef,
		app: &ChatApplication,
		channel_name: &str,
		nicknames: &[String],
		min_access_level: ChannelAccessLevel,
		unset_access_level: ChannelAccessLevel,
	)
	{
		let client_socket = app.current_client(socket);

		let is_client_operator = app.is_client_global_operator(&client_socket);

		let updated: Vec<_> = nicknames
			.iter()
			.filter_map(|nickname| {
				let Some(target_client_socket) = app.find_socket_by_nickname(client_socket.socket(), nickname) else {
					client_socket.send_err_nosuchnick(nickname);
					return None;
				};

				let same_client = client_socket.cid() == target_client_socket.cid();
				if
					!is_client_operator &&
					!same_client &&
					!app.does_client_have_rights_on_channel(
						&client_socket,
						channel_name,
						min_access_level,
					)
				{
					return None;
				}

				app.remove_member_access_level_on_channel(
					&target_client_socket,
					channel_name,
					unset_access_level,
				)
				.map(|member| {
					struct TargetMember<'a>
					{
						client: Socket<'a>,
						member: ChannelMember,
					}

					let join_room = |access_level: ChannelAccessLevel| {
						_ = target_client_socket.socket().join(format!(
							"channel:{}{}",
							access_level.symbol(),
							channel_name.to_lowercase(),
						));
					};
					let leave_room = |access_level: ChannelAccessLevel| {
						_ = target_client_socket.socket().leave(format!(
							"channel:{}{}",
							access_level.symbol(),
							channel_name.to_lowercase(),
						));
					};

					// TODO: à améliorer/mieux réfléchir cette partie de code
					match unset_access_level {
						| ChannelAccessLevel::Owner => {
							leave_room(ChannelAccessLevel::Owner);
							leave_room(ChannelAccessLevel::AdminOperator);
							leave_room(ChannelAccessLevel::Operator);
							leave_room(ChannelAccessLevel::HalfOperator);
							leave_room(ChannelAccessLevel::Vip);
						}
						| ChannelAccessLevel::AdminOperator => {
							leave_room(ChannelAccessLevel::AdminOperator);
							leave_room(ChannelAccessLevel::Operator);
							leave_room(ChannelAccessLevel::HalfOperator);
							leave_room(ChannelAccessLevel::Vip);
						}
						| ChannelAccessLevel::Operator => {
							leave_room(ChannelAccessLevel::Operator);
							leave_room(ChannelAccessLevel::HalfOperator);
							leave_room(ChannelAccessLevel::Vip);
						}
						| ChannelAccessLevel::HalfOperator => {
							leave_room(ChannelAccessLevel::HalfOperator);
							leave_room(ChannelAccessLevel::Vip);
						}
						| ChannelAccessLevel::Vip => {
							leave_room(ChannelAccessLevel::Vip);
						}
					}

					for access_level in member.access_level() {
						join_room(*access_level);
					}

					TargetMember {
						client: target_client_socket,
						member,
					}
				})
			})
			.collect();

		if updated.is_empty() {
			return;
		}

		let Some(channel) = app.get_channel(channel_name) else {
			client_socket.send_err_notonchannel(channel_name);
			return;
		};

		let removed_flags: Vec<_> = updated
			.iter()
			.map(|target_member| {
				let member = ChannelMemberDTO::from((target_member.client.client(), &target_member.member));
				(
					unset_access_level.letter(),
					ApplyMode {
						flag: unset_access_level,
						args: vec![member.user.nickname().to_owned()],
						updated_at: time::Utc::now(),
						updated_by: client_socket.user().nickname().to_owned(),
					},
				)
			})
			.collect();

		client_socket.emit_mode_access_level(&channel, &[], &removed_flags, true);

		client_socket.send_rpl_namreply(&channel, move |member| {
			let found = updated.iter().find(|target_member| target_member.member.id() == member.id())?;
			let found_client = app.get_client_by_id(found.member.id())?;
			Some(ChannelMemberDTO::from((found_client, &found.member)))
		});
	}
}

impl ModeChannelAccessLevelQOPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "QOP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEQOP";

	pub fn handle_set(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelOwnerOperatorCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::update_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Owner,
			ChannelAccessLevel::Owner,
		);
	}

	pub fn handle_unset(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelOwnerOperatorCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::remove_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Owner,
			ChannelAccessLevel::Owner,
		);
	}
}

impl ModeChannelAccessLevelAOPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "AOP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEAOP";

	pub fn handle_set(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelAdminOperatorCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::update_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Owner,
			ChannelAccessLevel::AdminOperator,
		);
	}

	pub fn handle_unset(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelAdminOperatorCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::remove_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Owner,
			ChannelAccessLevel::AdminOperator,
		);
	}
}

impl ModeChannelAccessLevelOPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "OP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEOP";

	pub fn handle_set(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelOperatorCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::update_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Operator,
			ChannelAccessLevel::Operator,
		);
	}

	pub fn handle_unset(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelOperatorCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::remove_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Operator,
			ChannelAccessLevel::Operator,
		);
	}
}

impl ModeChannelAccessLevelHOPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "HOP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEHOP";

	pub fn handle_set(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelHalfOperatorCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::update_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Operator,
			ChannelAccessLevel::HalfOperator,
		);
	}

	pub fn handle_unset(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelHalfOperatorCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::remove_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Operator,
			ChannelAccessLevel::HalfOperator,
		);
	}
}

impl ModeChannelAccessLevelVIPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "VIP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEVIP";

	pub fn handle_set(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelVipCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::update_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::HalfOperator,
			ChannelAccessLevel::Vip,
		);
	}

	pub fn handle_unset(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelVipCommandFormData>,
	)
	{
		ModeChannelAccessLevelHandler::remove_member_access_level(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::HalfOperator,
			ChannelAccessLevel::Vip,
		);
	}
}
