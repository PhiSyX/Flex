// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::client::{
	ClientInterface,
	ClientSocketInterface,
	Origin,
	Socket,
};
use flex_chat::mode::ApplyMode;
use flex_chat::user::{Flag, UserFlagInterface, UserInterface};

use crate::features::chat::mode::ModeCommandResponse;

// --------- //
// Interface //
// --------- //

pub trait UserClientSocketInterface
	: ClientSocketInterface
where
	Vec<(char, ApplyMode<Flag>)>: FromIterator<(
		char,
		ApplyMode<<<<
			Self as ClientSocketInterface>
					::Client as ClientInterface>
					::User as UserFlagInterface
				>::Flag
		>
	)>
{
	/// Émet au client les réponses liées à la commande /MODE.
	fn emit_user_modes(&self, user_modes: &[ApplyMode<Flag>])
	{
		let origin = Origin::from(self.client());
		let mode_cmd = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			added: user_modes
				.iter()
				.map(|flag| (flag.letter(), flag.clone()))
				.collect(),
			removed: Default::default(),
			target: self.user().nickname(),
			updated: false,
		};

		self.emit(mode_cmd.name(), mode_cmd);
	}

	/// Émet au client les réponses liées à la commande /MODE.
	fn emit_all_user_modes(&self)
	{
		let umodes: Vec<(char, ApplyMode<Flag>)> = self.user().flags().collect();

		if umodes.is_empty() {
			return;
		}

		let origin = Origin::from(self.client());
		let mode_cmd = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			added: umodes,
			removed: Default::default(),
			target: self.user().nickname(),
			updated: false,
		};

		self.emit(mode_cmd.name(), mode_cmd);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> UserClientSocketInterface for Socket<'s> {}
