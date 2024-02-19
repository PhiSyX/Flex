// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::client::ClientSocketInterface;
use crate::src::chat::components::{channel, client};
use crate::src::chat::features::ApplyMode;
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait ModeChannelAccessControlApplicationInterface
{
	fn apply_ban_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		mask: impl Into<channel::mode::Mask>,
	) -> Option<ApplyMode<channel::mode::AccessControlMode>>;

	fn apply_unban_for_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		mask: impl Into<channel::mode::Mask>,
	) -> Option<ApplyMode<channel::mode::AccessControlMode>>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ModeChannelAccessControlApplicationInterface for ChatApplication
{
	/// Applique un ban sur un salon.
	fn apply_ban_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		mask: impl Into<channel::mode::Mask>,
	) -> Option<ApplyMode<channel::mode::AccessControlMode>>
	{
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.add_ban(client_socket.user(), mask)
	}

	/// Applique un unban sur un salon.
	fn apply_unban_for_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		mask: impl Into<channel::mode::Mask>,
	) -> Option<ApplyMode<channel::mode::AccessControlMode>>
	{
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.remove_ban(client_socket.user(), mask)
	}
}
