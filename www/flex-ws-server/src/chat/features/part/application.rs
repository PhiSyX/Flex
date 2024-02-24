// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{ChannelName, ChannelNameSRef, ChannelsSessionInterface};
use flex_chat_client::{ClientSocketInterface, ClientsChannelSessionInterface, Socket};
use flex_chat_client_channel::ChannelClientSocketErrorReplies;
use flex_chat_user::UserInterface;

use super::{PartChannelsSessionInterface, PartClientSocketCommandResponseInterface};
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait PartChannelApplicationInterface
{
	fn internal_part_channel<S>(
		&self,
		client_socket: &Socket,
		channel_name: &ChannelName,
		message: Option<S>,
		forced: Option<&str>,
	) where
		S: std::ops::Deref<Target = str>;

	/// Force un utilisateur à quitter un salon.
	fn force_part_channel<S>(
		&self,
		client_socket: &Socket,
		force_to_part: &Socket,
		channel_name: &ChannelName,
		message: Option<S>,
	) where
		S: std::ops::Deref<Target = str>,
	{
		self.internal_part_channel(
			force_to_part,
			channel_name,
			message,
			Some(client_socket.user().nickname()),
		)
	}

	/// Part d'un salon.
	fn part_channel<S>(
		&self,
		client_socket: &Socket,
		channel_name: &ChannelName,
		message: Option<S>,
	) where
		S: std::ops::Deref<Target = str>,
	{
		self.internal_part_channel(client_socket, channel_name, message, None)
	}

	/// Part de tous les salons.
	fn part_all_channels(&self, client_socket: &Socket)
	{
		self.remove_client_from_all_his_channels(client_socket, Some("/PARTALL"))
	}

	/// Supprime un membre d'un salon. Si le salon n'a plus de membres, il sera
	/// également supprimé.
	fn remove_member_from_channel(
		&self,
		channel_name: ChannelNameSRef,
		member_client_socket: &Socket,
	) -> Option<()>;

	/// Supprime le client courant de tous ses salons.
	fn remove_client_from_all_his_channels<S>(&self, client_socket: &Socket, reason: Option<S>)
	where
		S: std::ops::Deref<Target = str>,
		S: Copy;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl PartChannelApplicationInterface for ChatApplication
{
	fn internal_part_channel<S>(
		&self,
		client_socket: &Socket,
		channel_name: &ChannelName,
		message: Option<S>,
		forced: Option<&str>,
	) where
		S: std::ops::Deref<Target = str>,
	{
		if !self.channels.has(channel_name) {
			client_socket.send_err_nosuchchannel(channel_name);
			return;
		}

		if !self.channels.has_member(channel_name, client_socket.cid()) {
			client_socket.send_err_notonchannel(channel_name);
			return;
		}

		self.remove_member_from_channel(channel_name, client_socket);

		client_socket.emit_part(channel_name, message, forced)
	}

	fn remove_member_from_channel(
		&self,
		channel_name: ChannelNameSRef,
		member_client_socket: &Socket,
	) -> Option<()>
	{
		self.clients
			.remove_channel_on_client(member_client_socket.cid(), channel_name);
		self.channels
			.remove_member(channel_name, member_client_socket.cid())
	}

	fn remove_client_from_all_his_channels<S>(&self, client_socket: &Socket, reason: Option<S>)
	where
		S: std::ops::Deref<Target = str>,
		S: Copy,
	{
		self.channels
			.remove_client_from_all_his_channels(client_socket.client());

		for channel_room in client_socket.channels_rooms() {
			let channel_name = &channel_room[8..];
			client_socket.emit_part(channel_name, reason, None);
		}
	}
}
