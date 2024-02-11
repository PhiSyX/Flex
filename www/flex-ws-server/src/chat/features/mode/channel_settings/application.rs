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

pub trait ModeChannelSettingsApplicationInterface
{
	/// Définit un nouveau mode de salon.
	fn set_settings_on_channel(
		&self,
		client_socket: &client::Socket,
		channel: channel::ChannelIDRef,
		flag: channel::mode::SettingsFlags,
	) -> Option<ApplyMode<channel::mode::SettingsFlags>>;

	/// Retire un mode de salon existant.
	fn unset_settings_on_channel(
		&self,
		client_socket: &client::Socket,
		channel: channel::ChannelIDRef,
		flag: channel::mode::SettingsFlags,
	) -> Option<ApplyMode<channel::mode::SettingsFlags>>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ModeChannelSettingsApplicationInterface for ChatApplication
{
	/// Définit un nouveau mode de salon.
	fn set_settings_on_channel(
		&self,
		client_socket: &client::Socket,
		channel: channel::ChannelIDRef,
		flag: channel::mode::SettingsFlags,
	) -> Option<ApplyMode<channel::mode::SettingsFlags>>
	{
		let Some(mut channel) = self.channels.get_mut(channel) else {
			client_socket.send_err_nosuchchannel(channel);
			return None;
		};

		channel
			.modes_settings
			.set(ApplyMode::new(flag).with_update_by(&client_socket.user().nickname))
	}

	/// Retire un mode de salon existant.
	fn unset_settings_on_channel(
		&self,
		client_socket: &client::Socket,
		channel: channel::ChannelIDRef,
		flag: channel::mode::SettingsFlags,
	) -> Option<ApplyMode<channel::mode::SettingsFlags>>
	{
		let Some(mut channel) = self.channels.get_mut(channel) else {
			client_socket.send_err_nosuchchannel(channel);
			return None;
		};
		channel
			.modes_settings
			.unset(ApplyMode::new(flag).with_update_by(&client_socket.user().nickname))
	}
}
