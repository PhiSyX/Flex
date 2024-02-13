// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::secret;

use super::{
	ChannelJoinError,
	JoinChannelClientSocketCommandResponseInterface,
	JoinChannelClientSocketErrorRepliesInterface,
	JoinChannelSessionInterface,
};
use crate::src::chat::components::{channel, client};
use crate::src::chat::features::{
	InviteChannelClientSocketErrorReplies,
	OperClientSocketErrorRepliesInterface,
};
use crate::src::chat::replies::ChannelMemberDTO;
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait JoinApplicationInterface
{
	/// Rejoint un salon.
	fn join_channel(
		&self,
		client_socket: &client::Socket,
		channel: &channel::Channel,
		forced: bool,
	);

	/// Rejoint un salon ou le crée.
	fn join_or_create_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		channel_key: Option<&secret::Secret<String>>,
	);

	/// Rejoint un salon ou le crée. Aucune vérification concernant la clé n'est
	/// faite. Cela veut dire que cette méthode peut joindre un salon même si le
	/// salon possède une clé.
	fn join_or_create_channel_bypass_permission(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl JoinApplicationInterface for ChatApplication
{
	fn join_channel(&self, client_socket: &client::Socket, channel: &channel::Channel, forced: bool)
	{
		self.clients
			.add_channel(client_socket.cid(), channel.id().as_str());

		client_socket.emit_join(channel, forced, |channel_nick| {
			let client = self.clients.get(channel_nick.member_id())?;
			Some(ChannelMemberDTO::from((client, channel_nick)))
		});
	}

	fn join_or_create_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		channel_key: Option<&secret::Secret<String>>,
	)
	{
		if !self.channels.has(channel_name) {
			self.channels.create(channel_name, channel_key.cloned());
			let channel = self
				.channels
				.add_member(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &channel, false);
		}

		let client_session = self.get_client_by_id(client_socket.cid()).unwrap();

		let can_join = self
			.channels
			.can_join(channel_name, channel_key, &client_session);

		if can_join.is_ok() {
			let channel = self
				.channels
				.add_member(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &channel, false);
			return;
		}

		if let Err(err) = can_join {
			match err {
				| ChannelJoinError::BadChannelKey => {
					client_socket.send_err_badchannelkey(channel_name);
				}
				| ChannelJoinError::InviteOnly => {
					client_socket.send_err_inviteonlychan(channel_name);
				}
				| ChannelJoinError::HasAlreadyClient => {}
				| ChannelJoinError::OperOnly => {
					client_socket.send_err_operonly(channel_name);
				}
			}
		}
	}

	fn join_or_create_channel_bypass_permission(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	)
	{
		if !self.channels.has(channel_name) {
			self.channels.create(channel_name, None);
			let channel = self
				.channels
				.add_member(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &channel, true);
		}

		let client_session = self.get_client_by_id(client_socket.cid()).unwrap();

		let can_join = self.channels.can_join(channel_name, None, &client_session);

		match can_join {
			| Ok(_) => {
				let channel = self
					.channels
					.add_member(channel_name, client_socket.cid())
					.expect("Le salon que le client a rejoint");
				self.join_channel(client_socket, &channel, true);
			}
			| Err(err) => {
				match err {
					| ChannelJoinError::BadChannelKey
					| ChannelJoinError::InviteOnly
					| ChannelJoinError::OperOnly => {
						let channel = self
							.channels
							.add_member(channel_name, client_socket.cid())
							.expect("Le salon que le client a rejoint");
						self.join_channel(client_socket, &channel, true);
					}
					| ChannelJoinError::HasAlreadyClient => {}
				}
			}
		}
	}
}
