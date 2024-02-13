// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::time;
use socketioxide::extract::{Data, SocketRef, State};

use super::application::ModeChannelAccessLevelApplicationInterface;
use super::client::ModeAccessLevelClientSocketInterface;
use super::{
	AccessLevelAdminOperatorCommandFormData,
	AccessLevelHalfOperatorCommandFormData,
	AccessLevelOperatorCommandFormData,
	AccessLevelOwnerOperatorCommandFormData,
	AccessLevelVipCommandFormData,
};
use crate::src::chat::components::channel::member;
use crate::src::chat::components::channel::mode::ChannelAccessLevel;
use crate::src::chat::components::client::ClientSocketInterface;
use crate::src::chat::components::{channel, client};
use crate::src::chat::features::{ApplyMode, OperApplicationInterface};
use crate::src::chat::replies::ChannelMemberDTO;
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

struct ModeAccessLevelHandler;

pub struct ModeAccessLevelQOPHandler;
pub struct ModeAccessLevelAOPHandler;
pub struct ModeAccessLevelOPHandler;
pub struct ModeAccessLevelHOPHandler;
pub struct ModeAccessLevelVIPHandler;

// -------------- //
// Implémentation //
// -------------- //

impl ModeAccessLevelHandler
{
	fn update_access_level_for_nick(
		socket: &SocketRef,
		app: &ChatApplication,
		channel_name: channel::ChannelIDRef,
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
				let Some(target_client_socket) =
					app.find_socket_by_nickname(client_socket.socket(), nickname)
				else {
					client_socket.send_err_nosuchnick(nickname);
					return None;
				};

				app.update_client_access_level_on_channel(
					&target_client_socket,
					channel_name,
					set_access_level,
				)
				.map(|nick| {
					struct TargetNick<'a>
					{
						client: client::Socket<'a>,
						nick: member::ChannelMember,
					}

					// TODO: à améliorer/mieux réfléchir cette partie de code
					match set_access_level {
						| ChannelAccessLevel::Owner => {
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::Owner.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::AdminOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::Operator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::HalfOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
						| ChannelAccessLevel::AdminOperator => {
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::AdminOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::Operator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::HalfOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
						| ChannelAccessLevel::Operator => {
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::Operator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::HalfOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
						| ChannelAccessLevel::HalfOperator => {
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::HalfOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
						| ChannelAccessLevel::Vip => {
							_ = target_client_socket.socket().join(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
					}

					TargetNick {
						client: target_client_socket,
						nick,
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
			.map(|target_nick| {
				let member =
					ChannelMemberDTO::from((target_nick.client.client(), &target_nick.nick));
				(
					set_access_level.letter(),
					ApplyMode {
						flag: set_access_level,
						args: vec![member.user.nickname.to_owned()],
						updated_at: time::Utc::now(),
						updated_by: client_socket.user().nickname.to_owned(),
					},
				)
			})
			.collect();

		client_socket.emit_mode_access_level(&channel, &added_flags, &[], true);

		client_socket.send_rpl_namreply(&channel, move |nick| {
			let found = updated
				.iter()
				.find(|target_nick| target_nick.nick.member_id() == nick.member_id())?;
			let found_client = app.get_client_by_id(found.nick.member_id())?;
			Some(ChannelMemberDTO::from((found_client, &found.nick)))
		});
	}

	fn remove_access_level_for_nick(
		socket: &SocketRef,
		app: &ChatApplication,
		channel_name: &channel::ChannelID,
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
				let Some(target_client_socket) =
					app.find_socket_by_nickname(client_socket.socket(), nickname)
				else {
					client_socket.send_err_nosuchnick(nickname);
					return None;
				};

				let same_client = client_socket.cid() == target_client_socket.cid();
				if !is_client_operator
					&& !same_client && !app.does_client_have_rights_on_channel(
					&client_socket,
					channel_name,
					min_access_level,
				) {
					return None;
				}

				app.remove_client_access_level_on_channel(
					&target_client_socket,
					channel_name,
					unset_access_level,
				)
				.map(|nick| {
					struct TargetNick<'a>
					{
						client: client::Socket<'a>,
						nick: member::ChannelMember,
					}

					// TODO: à améliorer/mieux réfléchir cette partie de code
					match unset_access_level {
						| ChannelAccessLevel::Owner => {
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::Owner.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::AdminOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::Operator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::HalfOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
						| ChannelAccessLevel::AdminOperator => {
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::AdminOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::Operator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::HalfOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
						| ChannelAccessLevel::Operator => {
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::Operator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::HalfOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
						| ChannelAccessLevel::HalfOperator => {
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::HalfOperator.symbol(),
								channel_name.to_lowercase(),
							));
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
						| ChannelAccessLevel::Vip => {
							_ = target_client_socket.socket().leave(format!(
								"channel:{}{}",
								ChannelAccessLevel::Vip.symbol(),
								channel_name.to_lowercase(),
							));
						}
					}

					for access_level in &nick.access_level {
						_ = target_client_socket.socket().join(format!(
							"channel:{}{}",
							access_level.symbol(),
							channel_name.to_lowercase(),
						));
					}

					TargetNick {
						client: target_client_socket,
						nick,
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
			.map(|target_nick| {
				let member =
					ChannelMemberDTO::from((target_nick.client.client(), &target_nick.nick));
				(
					unset_access_level.letter(),
					ApplyMode {
						flag: unset_access_level,
						args: vec![member.user.nickname.to_owned()],
						updated_at: time::Utc::now(),
						updated_by: client_socket.user().nickname.to_owned(),
					},
				)
			})
			.collect();

		client_socket.emit_mode_access_level(&channel, &[], &removed_flags, true);

		client_socket.send_rpl_namreply(&channel, move |nick| {
			let found = updated
				.iter()
				.find(|target_nick| target_nick.nick.member_id() == nick.member_id())?;
			let found_client = app.get_client_by_id(found.nick.member_id())?;
			Some(ChannelMemberDTO::from((found_client, &found.nick)))
		});
	}
}

impl ModeAccessLevelQOPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "QOP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEQOP";

	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelOwnerOperatorCommandFormData>,
	)
	{
		ModeAccessLevelHandler::update_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Owner,
			ChannelAccessLevel::Owner,
		);
	}

	pub fn handle_remove(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelOwnerOperatorCommandFormData>,
	)
	{
		ModeAccessLevelHandler::remove_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Owner,
			ChannelAccessLevel::Owner,
		);
	}
}

impl ModeAccessLevelAOPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "AOP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEAOP";

	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelAdminOperatorCommandFormData>,
	)
	{
		ModeAccessLevelHandler::update_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Owner,
			ChannelAccessLevel::AdminOperator,
		);
	}

	pub fn handle_remove(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelAdminOperatorCommandFormData>,
	)
	{
		ModeAccessLevelHandler::remove_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Owner,
			ChannelAccessLevel::AdminOperator,
		);
	}
}

impl ModeAccessLevelOPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "OP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEOP";

	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelOperatorCommandFormData>,
	)
	{
		ModeAccessLevelHandler::update_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Operator,
			ChannelAccessLevel::Operator,
		);
	}

	pub fn handle_remove(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelOperatorCommandFormData>,
	)
	{
		ModeAccessLevelHandler::remove_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Operator,
			ChannelAccessLevel::Operator,
		);
	}
}

impl ModeAccessLevelHOPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "HOP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEHOP";

	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelHalfOperatorCommandFormData>,
	)
	{
		ModeAccessLevelHandler::update_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Operator,
			ChannelAccessLevel::HalfOperator,
		);
	}

	pub fn handle_remove(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelHalfOperatorCommandFormData>,
	)
	{
		ModeAccessLevelHandler::remove_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::Operator,
			ChannelAccessLevel::HalfOperator,
		);
	}
}

impl ModeAccessLevelVIPHandler
{
	pub const SET_COMMAND_NAME: &'static str = "VIP";
	pub const UNSET_COMMAND_NAME: &'static str = "DEVIP";

	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelVipCommandFormData>,
	)
	{
		ModeAccessLevelHandler::update_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::HalfOperator,
			ChannelAccessLevel::Vip,
		);
	}

	pub fn handle_remove(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AccessLevelVipCommandFormData>,
	)
	{
		ModeAccessLevelHandler::remove_access_level_for_nick(
			&socket,
			app,
			&data.channel,
			&data.nicknames,
			ChannelAccessLevel::HalfOperator,
			ChannelAccessLevel::Vip,
		);
	}
}
