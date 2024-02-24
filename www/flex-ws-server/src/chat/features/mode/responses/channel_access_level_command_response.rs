// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{Channel, ChannelAccessLevel, ChannelInterface};
use flex_chat_client::{ClientSocketInterface, Origin, Socket};
use flex_chat_mode::ApplyMode;

use super::ModeCommandResponse;

// --------- //
// Interface //
// --------- //

pub trait ModeAccessLevelClientSocketInterface: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client courant les membres avec leurs niveaux d'accès sur un
	/// salon.
	fn emit_mode_access_level(
		&self,
		channel: &Self::Channel,
		added_flags: &[(char, ApplyMode<ChannelAccessLevel>)],
		removed_flags: &[(char, ApplyMode<ChannelAccessLevel>)],
		updated: bool,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ModeAccessLevelClientSocketInterface for Socket<'s>
{
	type Channel = Channel;

	fn emit_mode_access_level(
		&self,
		channel: &Self::Channel,
		added_flags: &[(char, ApplyMode<ChannelAccessLevel>)],
		removed_flags: &[(char, ApplyMode<ChannelAccessLevel>)],
		updated: bool,
	)
	{
		let origin = Origin::from(self.client());

		let mode = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			added: added_flags.to_owned(),
			removed: removed_flags.to_owned(),
			target: &channel.name,
			updated,
		};

		self.emit_within(channel.room(), mode.name(), mode);
	}
}
