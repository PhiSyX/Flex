// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::{ChannelTopicError, TopicChannelsSessionInterface, TopicClientSocketInterface};
use crate::src::chat::components::client::ClientSocketInterface;
use crate::src::chat::components::{channel, client};
use crate::src::chat::features::OperApplicationInterface;
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait TopicApplicationInterface
{
	/// Est-ce que le client PEUT éditer le sujet d'un salon.
	fn is_client_can_edit_topic(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	) -> bool;

	/// Met à jour le sujet d'un salon.
	fn update_topic(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		topic: impl AsRef<str>,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl TopicApplicationInterface for ChatApplication
{
	fn is_client_can_edit_topic(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
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
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		topic: impl AsRef<str>,
	)
	{
		self.channels
			.update_topic(channel_name, topic, &client_socket.user().nickname);

		let Some(channel) = self.get_channel(channel_name) else {
			return;
		};

		client_socket.send_rpl_topic(&channel, true);
	}
}
