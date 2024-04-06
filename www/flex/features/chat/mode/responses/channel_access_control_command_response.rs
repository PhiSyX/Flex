// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{
	AccessControlMask,
	Channel,
	ChannelAccessControlInterface,
	ChannelInterface,
};
use flex_chat_client::{ClientSocketInterface, Origin, Socket};
use flex_chat_mode::ApplyMode;

use super::ModeCommandResponse;

// --------- //
// Interface //
// --------- //

pub trait ModeAccessControlClientSocketCommandResponseInterface
	: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client courant les modes d'accès de contrôles d'un salon.
	fn emit_channel_access_control(
		&self,
		channel: &Self::Channel,
		added_flags: Vec<(char, ApplyMode<AccessControlMask>)>,
		removed_flags: Vec<(char, ApplyMode<AccessControlMask>)>,
		updated: bool,
	);

	/// Émet au client courant les modes d'accès de contrôles d'un salon.
	fn emit_target_access_control(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		added_flags: &[(char, ApplyMode<AccessControlMask>)],
		removed_flags: &[(char, ApplyMode<AccessControlMask>)],
		updated: bool,
	);

	/// Émet au client courant tous les controls d'accès du salon.
	fn emit_all_channel_access_control(&self, channel: &Self::Channel);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ModeAccessControlClientSocketCommandResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn emit_channel_access_control(
		&self,
		channel: &Self::Channel,
		added_flags: Vec<(char, ApplyMode<AccessControlMask>)>,
		removed_flags: Vec<(char, ApplyMode<AccessControlMask>)>,
		updated: bool,
	)
	{
		self.emit_target_access_control(
			channel.name(),
			&added_flags,
			&removed_flags,
			updated,
		);
	}

	fn emit_target_access_control(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		added_flags: &[(char, ApplyMode<AccessControlMask>)],
		removed_flags: &[(char, ApplyMode<AccessControlMask>)],
		updated: bool,
	)
	{
		let origin = Origin::from(self.client());

		let mode_cmd = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			added: added_flags.to_vec(),
			removed: removed_flags.to_vec(),
			target: channel_name,
			updated,
		};
		let channel_room = format!("channel:{}", channel_name.to_lowercase());
		self.emit_within(channel_room, mode_cmd.name(), mode_cmd);
	}

	fn emit_all_channel_access_control(&self, channel: &Self::Channel)
	{
		let list: Vec<_> = channel.access_controls().into_iter().collect();

		if list.is_empty() {
			return;
		}

		let origin = Origin::from(self.client());

		let mode_cmd = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			target: channel.name(),
			removed: Default::default(),
			added: list,
			updated: false,
		};

		self.emit(mode_cmd.name(), mode_cmd);
	}
}
