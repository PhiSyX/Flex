// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{
	Channel,
	ChannelInterface,
	ChannelsSessionInterface,
	SettingsFlag,
};
use flex_chat::client::{
	ClientInterface,
	ClientServerApplicationInterface,
	ClientSocketInterface,
	Socket,
};
use flex_chat::mode::ApplyMode;
use flex_chat::user::{Flag, UserInterface, UserOperatorInterface};

use super::{
	OperClientSessionInterface,
	OperClientSocketCommandResponse,
	OperClientSocketErrorRepliesInterface,
};
use crate::config::chat::{
	FlexChatConfigOperatorAuth,
	FlexChatConfigOperatorFlags,
	FlexChatConfigOperatorType,
};
use crate::features::chat::connect::UserClientSocketInterface;
use crate::features::chat::invite::InviteChannelClientSocketErrorReplies;
use crate::features::chat::join::{
	JoinApplicationInterface,
	JoinChannelPermissionError,
	JoinChannelsSessionInterface,
	JoinErrorResponseInterface,
};
use crate::features::chat::mode::ModeAccessControlClientSocketErrorRepliesInterface;
use crate::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait OperApplicationInterface
{
	type Channel: ChannelInterface;
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Est-ce que le client est un opérateur global?
	fn is_client_global_operator(
		&self,
		client_socket: &Self::ClientSocket<'_>,
	) -> bool;

	/// Rejoint un salon opérateur ou le crée.
	fn join_or_create_oper_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	);

	/// Marque le client en session comme étant un opérateur.
	fn marks_client_as_operator(
		&self,
		client_socket: &mut Self::ClientSocket<'_>,
		oper: &FlexChatConfigOperatorAuth,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl OperApplicationInterface for ChatApplication
{
	type Channel = Channel;
	type ClientSocket<'cs> = Socket<'cs>;

	fn is_client_global_operator(
		&self,
		client_socket: &Self::ClientSocket<'_>,
	) -> bool
	{
		let Some(client) = self.get_client_by_id(client_socket.cid()) else {
			return false;
		};
		client.user().is_global_operator()
	}

	fn join_or_create_oper_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	)
	{
		if !self.channels.has(channel_name) {
			self.channels.create_with_flags(
				channel_name,
				None,
				[
					ApplyMode::new(SettingsFlag::OperOnly),
					ApplyMode::new(SettingsFlag::Secret),
				],
			);
			let mut channel = self
				.channels
				.add_member_id(channel_name, *client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &mut channel, true);
		}

		let client_session =
			self.get_client_by_id(client_socket.cid()).unwrap();
		let can_join =
			self.channels.can_join(&client_session, channel_name, None);

		if can_join.is_ok() {
			let mut channel = self
				.channels
				.add_member_id(channel_name, *client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &mut channel, true);
			return;
		}

		if let Err(err) = can_join {
			match err {
				| JoinChannelPermissionError::ERR_NOSUCHCHANNEL => {}

				| JoinChannelPermissionError::ERR_BANNEDFROMCHAN => {
					client_socket.send_err_bannedfromchan(channel_name);
				}
				| JoinChannelPermissionError::ERR_BADCHANNELKEY => {
					client_socket.send_err_badchannelkey(channel_name);
				}
				| JoinChannelPermissionError::ERR_CHANNELISFULL => {
					client_socket.send_err_channelisfull(channel_name);
				}
				| JoinChannelPermissionError::ERR_INVITEONLYCHAN => {
					client_socket.send_err_inviteonlychan(channel_name);
				}
				| JoinChannelPermissionError::ERR_USERONCHANNEL => {}
				| JoinChannelPermissionError::ERR_OPERONLY => {
					client_socket.send_err_operonly(channel_name);
				}
			}
		}
	}

	fn marks_client_as_operator(
		&self,
		client_socket: &mut Self::ClientSocket<'_>,
		oper: &FlexChatConfigOperatorAuth,
	)
	{
		self.clients
			.marks_client_as_operator(client_socket.cid(), oper);

		if let Some(vhost) = oper.virtual_host.as_deref() {
			client_socket.user_mut().set_vhost(vhost);
		}

		client_socket
			.client_mut()
			.marks_client_as_operator(oper.oper_type, &oper.flags);

		let flag_oper = match oper.oper_type {
			| FlexChatConfigOperatorType::LocalOperator => Flag::LocalOperator,
			| FlexChatConfigOperatorType::GlobalOperator => {
				Flag::GlobalOperator
			}
		};

		client_socket.emit_user_modes(&[ApplyMode::new(flag_oper.clone())]);

		client_socket.send_rpl_youreoper(&flag_oper);
	}
}

impl From<FlexChatConfigOperatorType> for flex_chat::user::Flag
{
	#[rustfmt::skip]
	fn from(ty: FlexChatConfigOperatorType) -> Self
	{
		match ty {
			| FlexChatConfigOperatorType::LocalOperator => Self::LocalOperator,
			| FlexChatConfigOperatorType::GlobalOperator => Self::GlobalOperator,
		}
	}
}

impl From<&FlexChatConfigOperatorFlags> for flex_chat::user::Flag
{
	fn from(flag: &FlexChatConfigOperatorFlags) -> Self
	{
		match flag {
			| FlexChatConfigOperatorFlags::NoKick => Self::NoKick,
		}
	}
}
