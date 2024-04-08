// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{Channel, ChannelInterface};
use flex_chat::client::channel::responses::ChannelClientSocketErrorReplies;
use flex_chat::client::{ClientSocketInterface, Socket};
use flex_chat::user::UserInterface;

use super::{
	ChannelTopicError,
	TopicChannelsSessionInterface,
	TopicClientSocketInterface,
};
use crate::features::chat::oper::OperApplicationInterface;
use crate::features::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait TopicApplicationInterface
{
	type Channel: ChannelInterface;
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Est-ce que le client PEUT éditer le sujet d'un salon.
	fn is_client_can_edit_topic(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> bool;

	/// Met à jour le sujet d'un salon.
	fn update_topic(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		topic: impl AsRef<str>,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl TopicApplicationInterface for ChatApplication
{
	type Channel = Channel;
	type ClientSocket<'cs> = Socket<'cs>;

	fn is_client_can_edit_topic(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> bool
	{
		let is_client_operator = self.is_client_global_operator(client_socket);

		if is_client_operator {
			return true;
		}

		match self
			.channels
			.is_client_can_edit_topic(channel_name, client_socket.client())
		{
			| Ok(_) => true,
			| Err(err) => {
				match err {
					| ChannelTopicError::ERR_NOTONCHANNEL => {
						client_socket.send_err_notonchannel(channel_name);
					}
					| ChannelTopicError::ERR_BANNEDFROMCHAN => {
						client_socket.send_err_chanoprivsneeded(channel_name);
					}
					| ChannelTopicError::ERR_CHANOPRIVSNEEDED => {
						client_socket.send_err_chanoprivsneeded(channel_name);
					}
				};
				false
			}
		}
	}

	fn update_topic(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		topic: impl AsRef<str>,
	)
	{
		self.channels.update_topic(
			channel_name,
			topic,
			client_socket.user().nickname(),
		);

		#[rustfmt::skip]
		let Some(channel) = self.get_channel(channel_name) else { return };

		client_socket.send_rpl_topic(&channel, true);
	}
}
