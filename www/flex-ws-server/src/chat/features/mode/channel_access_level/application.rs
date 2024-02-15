// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::session::ModeChannelAccessLevelChannelsSessionInterface;
use crate::src::chat::components::{channel, client};
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait ModeChannelAccessLevelApplicationInterface
{
	/// Est-ce que le client courant a le droit demandé sur le salon.
	fn does_client_have_rights_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		min_access_level: channel::mode::ChannelAccessLevel,
	) -> bool;

	/// Met à jour les niveaux d'accès d'un client sur un salon.
	fn update_member_access_level_on_channel(
		&self,
		client_socket: &client::Socket,
		channel: channel::ChannelIDRef,
		set_access_level: channel::mode::ChannelAccessLevel,
	) -> Option<channel::member::ChannelMember>;

	/// Supprime un niveau d'accès pour un pseudo d'un salon.
	fn remove_member_access_level_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		unset_access_level: channel::mode::ChannelAccessLevel,
	) -> Option<channel::member::ChannelMember>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ModeChannelAccessLevelApplicationInterface for ChatApplication
{
	fn does_client_have_rights_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		min_access_level: channel::mode::ChannelAccessLevel,
	) -> bool
	{
		let is_ok = self.channels.does_member_have_rights(
			channel_name,
			client_socket.cid(),
			min_access_level,
		);
		if !is_ok {
			client_socket.send_err_chanoprivsneeded(channel_name);
		}
		is_ok
	}

	fn update_member_access_level_on_channel(
		&self,
		client_socket: &client::Socket,
		channel: channel::ChannelIDRef,
		set_access_level: channel::mode::ChannelAccessLevel,
	) -> Option<channel::member::ChannelMember>
	{
		self.channels
			.update_client_access_level(channel, client_socket.cid(), set_access_level)
	}

	fn remove_member_access_level_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		unset_access_level: channel::mode::ChannelAccessLevel,
	) -> Option<channel::member::ChannelMember>
	{
		self.channels.remove_client_access_level(
			channel_name,
			client_socket.cid(),
			unset_access_level,
		)
	}
}
