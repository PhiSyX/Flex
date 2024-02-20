// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::{
	OperClientSessionInterface,
	OperClientSocketCommandResponse,
	OperClientSocketErrorRepliesInterface,
};
use crate::config::flex;
use crate::features::ChatApplication;
use crate::src::chat::components::client::{self, ClientSocketInterface};
use crate::src::chat::components::{self, channel};
use crate::src::chat::features::{
	ApplyMode,
	ChannelJoinError,
	InviteChannelClientSocketErrorReplies,
	JoinApplicationInterface,
	JoinChannelClientSocketErrorRepliesInterface,
	JoinChannelSessionInterface,
	ModeAccessControlClientSocketErrorRepliesInterface,
	UserClientSocketInterface,
};

// --------- //
// Interface //
// --------- //

pub trait OperApplicationInterface
{
	/// Est-ce que le client est un opérateur global?
	fn is_client_global_operator(&self, client_socket: &client::Socket) -> bool;

	/// Rejoint un salon opérateur ou le crée.
	fn join_or_create_oper_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	);

	/// Marque le client en session comme étant un opérateur.
	fn marks_client_as_operator(
		&self,
		client_socket: &mut client::Socket,
		oper: &flex::flex_config_operator_auth,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl OperApplicationInterface for ChatApplication
{
	fn is_client_global_operator(&self, client_socket: &client::Socket) -> bool
	{
		let Some(client) = self.get_client_by_id(client_socket.cid()) else {
			return false;
		};
		client.user().is_global_operator()
	}

	fn join_or_create_oper_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	)
	{
		if !self.channels.has(channel_name) {
			self.channels.create_with_flags(
				channel_name,
				None,
				[
					ApplyMode::new(channel::mode::SettingsFlags::OperOnly),
					ApplyMode::new(channel::mode::SettingsFlags::Secret),
				],
			);
			let mut channel = self
				.channels
				.add_member(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &mut channel, true);
		}

		let client_session = self.get_client_by_id(client_socket.cid()).unwrap();
		let can_join = self.channels.can_join(channel_name, None, &client_session);

		if can_join.is_ok() {
			let mut channel = self
				.channels
				.add_member(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &mut channel, true);
			return;
		}

		if let Err(err) = can_join {
			match err {
				| ChannelJoinError::ERR_BANNEDFROMCHAN => {
					client_socket.send_err_bannedfromchan(channel_name);
				}
				| ChannelJoinError::BadChannelKey => {
					client_socket.send_err_badchannelkey(channel_name);
				}
				| ChannelJoinError::InviteOnly => {
					client_socket.send_err_inviteonlychan(channel_name);
				}
				| ChannelJoinError::HasAlreadyMember => {}
				| ChannelJoinError::OperOnly => {
					client_socket.send_err_operonly(channel_name);
				}
			}
		}
	}

	fn marks_client_as_operator(
		&self,
		client_socket: &mut client::Socket,
		oper: &flex::flex_config_operator_auth,
	)
	{
		self.clients
			.marks_client_as_operator(client_socket.cid(), oper);

		if let Some(vhost) = oper.virtual_host.as_deref() {
			client_socket.user_mut().set_vhost(vhost);
		}

		client_socket.client_mut().marks_client_as_operator(oper);

		let flag_oper = match oper.oper_type {
			| flex::flex_config_operator_type::LocalOperator => {
				components::user::Flag::LocalOperator
			}
			| flex::flex_config_operator_type::GlobalOperator => {
				components::user::Flag::GlobalOperator
			}
		};

		client_socket.emit_user_modes(&[ApplyMode::new(flag_oper.clone())]);

		client_socket.send_rpl_youreoper(flag_oper);
	}
}
