// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use client::Origin;

use crate::src::chat::components;
use crate::src::chat::components::client::{self, ClientSocketInterface};
use crate::src::chat::features::{ApplyMode, ModeCommandResponse};

// --------- //
// Interface //
// --------- //

pub trait ModeChannelSettingsClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client courant les paramètres un salon.
	fn emit_all_channels_settings(&self, channel: &components::channel::Channel, updated: bool)
	{
		let origin = Origin::from(self.client());

		let channel_settings = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			target: &channel.name,
			removed: Default::default(),
			added: channel.settings().into_iter().collect(),
			updated,
		};
		self.emit(channel_settings.name(), channel_settings);
	}

	/// Émet au client courant les paramètres un salon.
	fn emit_channel_settings(
		&self,
		target: &str,
		added: &[ApplyMode<components::mode::SettingsFlags>],
		removed: &[ApplyMode<components::mode::SettingsFlags>],
	)
	{
		if added.is_empty() && removed.is_empty() {
			return;
		}

		let origin = Origin::from(self.client());

		let channel_settings = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			target,
			added: added
				.iter()
				.map(|mode| (mode.letter(), mode.clone()))
				.collect(),
			removed: removed
				.iter()
				.map(|mode| (mode.letter(), mode.clone()))
				.collect(),
			updated: true,
		};

		let channel_room = format!("channel:{}", target.to_lowercase());
		self.emit_within(channel_room, channel_settings.name(), channel_settings);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ModeChannelSettingsClientSocketCommandResponseInterface for client::Socket<'s> {}
