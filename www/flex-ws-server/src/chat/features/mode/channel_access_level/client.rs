// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::{self, client, ClientSocketInterface, Origin};
use crate::src::chat::features::{ApplyMode, ModeCommandResponse};

// --------- //
// Interface //
// --------- //

pub trait ModeAccessLevelClientSocketInterface: ClientSocketInterface
{
	/// Émet au client courant les membres avec leurs niveaux d'accès sur un
	/// salon.
	fn emit_mode_access_level(
		&self,
		channel: &components::channel::Channel,
		added_flags: Vec<(char, ApplyMode<components::mode::ChannelAccessLevel>)>,
		removed_flags: Vec<(char, ApplyMode<components::mode::ChannelAccessLevel>)>,
		updated: bool,
	)
	{
		let origin = Origin::from(self.client());

		let mode = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			added: added_flags,
			removed: removed_flags,
			target: &channel.name,
			updated,
		};

		self.emit_within(channel.room(), mode.name(), mode);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ModeAccessLevelClientSocketInterface for client::Socket<'s> {}
