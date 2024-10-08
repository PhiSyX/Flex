// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{ChannelAccessLevel, ChannelMember, MemberInterface};
use flex_chat::client::channel::responses::{
	ChannelClientSocketCommandResponse,
	ChannelClientSocketErrorReplies,
};
use flex_chat::client::nick::responses::NickClientSocketErrorReplies;
use flex_chat::client::{
	ClientServerApplicationInterface,
	ClientSocketInterface,
	Socket,
};
use flex_chat::mode::ApplyMode;
use flex_chat::user::UserInterface;
use flex_web_framework::types::time;
use flex_web_framework::WebSocketHandler2;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::mode::{
	AccessLevelAdminOperatorCommandFormData,
	AccessLevelHalfOperatorCommandFormData,
	AccessLevelOperatorCommandFormData,
	AccessLevelOwnerOperatorCommandFormData,
	AccessLevelVipCommandFormData,
	ChannelMemberDTO,
	ModeAccessLevelClientSocketInterface,
	ModeChannelAccessLevelApplicationInterface,
};
use crate::features::chat::oper::OperApplicationInterface;
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

		if !app.is_client_global_operator(&client_socket)
			&& !app.does_client_have_rights_on_channel(
				&client_socket,
				channel_name,
				min_access_level,
			) {
			return;
		}

		let updated: Vec<_> = nicknames
			.iter()
			.filter_map(|nickname| {
				let Some(target_client_socket) = app
					.find_socket_by_nickname(client_socket.socket(), nickname)
				else {
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
				let member = ChannelMemberDTO::from((
					target_member.client.client(),
					&target_member.member,
				));
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
			let found = updated.iter().find(|target_member| {
				target_member.member.id() == member.id()
			})?;
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
				let Some(target_client_socket) = app
					.find_socket_by_nickname(client_socket.socket(), nickname)
				else {
					client_socket.send_err_nosuchnick(nickname);
					return None;
				};

				let same_client =
					client_socket.cid() == target_client_socket.cid();
				if !is_client_operator
					&& !same_client && !app.does_client_have_rights_on_channel(
					&client_socket,
					channel_name,
					min_access_level,
				) {
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
						if member
							.highest_access_level()
							.filter(|mac| mac.flag() >= access_level.flag())
							.is_some()
						{
							return;
						}

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
				let member = ChannelMemberDTO::from((
					target_member.client.client(),
					&target_member.member,
				));
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

		client_socket.emit_mode_access_level(
			&channel,
			&[],
			&removed_flags,
			true,
		);

		client_socket.send_rpl_namreply(&channel, move |member| {
			let found = updated.iter().find(|target_member| {
				target_member.member.id() == member.id()
			})?;
			let found_client = app.get_client_by_id(found.member.id())?;
			Some(ChannelMemberDTO::from((found_client, &found.member)))
		});
	}
}

impl WebSocketHandler2 for ModeChannelAccessLevelQOPHandler
{
	type App = ChatApplication;
	type SetData = AccessLevelOwnerOperatorCommandFormData;
	type UnsetData = AccessLevelOwnerOperatorCommandFormData;

	const SET_EVENT_NAME: &'static str = "QOP";
	const UNSET_EVENT_NAME: &'static str = "DEQOP";

	fn handle_set(
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

	fn handle_unset(
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

impl WebSocketHandler2 for ModeChannelAccessLevelAOPHandler
{
	type App = ChatApplication;
	type SetData = AccessLevelAdminOperatorCommandFormData;
	type UnsetData = AccessLevelAdminOperatorCommandFormData;

	const SET_EVENT_NAME: &'static str = "AOP";
	const UNSET_EVENT_NAME: &'static str = "DEAOP";

	fn handle_set(
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

	fn handle_unset(
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

impl WebSocketHandler2 for ModeChannelAccessLevelOPHandler
{
	type App = ChatApplication;
	type SetData = AccessLevelOperatorCommandFormData;
	type UnsetData = AccessLevelOperatorCommandFormData;

	const SET_EVENT_NAME: &'static str = "OP";
	const UNSET_EVENT_NAME: &'static str = "DEOP";

	fn handle_set(
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

	fn handle_unset(
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

impl WebSocketHandler2 for ModeChannelAccessLevelHOPHandler
{
	type App = ChatApplication;
	type SetData = AccessLevelHalfOperatorCommandFormData;
	type UnsetData = AccessLevelHalfOperatorCommandFormData;

	const SET_EVENT_NAME: &'static str = "HOP";
	const UNSET_EVENT_NAME: &'static str = "DEHOP";

	fn handle_set(
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

	fn handle_unset(
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

impl WebSocketHandler2 for ModeChannelAccessLevelVIPHandler
{
	type App = ChatApplication;
	type SetData = AccessLevelVipCommandFormData;
	type UnsetData = AccessLevelVipCommandFormData;

	const SET_EVENT_NAME: &'static str = "VIP";
	const UNSET_EVENT_NAME: &'static str = "DEVIP";

	fn handle_set(
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

	fn handle_unset(
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
