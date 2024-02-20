// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::{channel, client, ClientSocketInterface, Origin};
use crate::src::chat::features::{ApplyMode, ModeCommandResponse};

// --------- //
// Interface //
// --------- //

pub trait ModeAccessControlClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client courant les modes d'accès de contrôles d'un salon.
	fn emit_mode_access_control(
		&self,
		channel: &channel::Channel,
		added_flags: Vec<(char, ApplyMode<channel::mode::AccessControlMode>)>,
		removed_flags: Vec<(char, ApplyMode<channel::mode::AccessControlMode>)>,
		updated: bool,
	)
	{
		let origin = Origin::from(self.client());

		let mode_cmd = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			added: added_flags,
			removed: removed_flags,
			target: &channel.name,
			updated,
		};
		self.emit_within(channel.room(), mode_cmd.name(), mode_cmd);
	}

	/// Émet au client courant tous les controls d'accès du salon.
	fn emit_all_access_control(&self, channel: &channel::Channel)
	{
		let list: Vec<_> = channel.access_controls().into_iter().collect();

		if list.is_empty() {
			return;
		}

		let origin = Origin::from(self.client());

		let mode_cmd = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			target: &channel.name,
			removed: Default::default(),
			added: list,
			updated: false,
		};

		self.emit(mode_cmd.name(), mode_cmd);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ModeAccessControlClientSocketCommandResponseInterface for client::Socket<'s> {}
