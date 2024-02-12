// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::SilenceCommandResponse;
use crate::src::chat::components::{self, client, ClientSocketInterface, Origin};

// --------- //
// Interface //
// --------- //

pub trait SilenceClientSocketInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /SILENCE.
	fn emit_silence(&self, users: &[&components::Origin], updated: Option<bool>)
	{
		let origin = Origin::from(self.client());
		let silence_command = SilenceCommandResponse {
			origin: &origin,
			tags: SilenceCommandResponse::default_tags(),
			added: matches!(updated, Some(true) | None),
			removed: matches!(updated, Some(false)),
			users,
			updated: updated.is_some(),
		};
		self.emit(silence_command.name(), silence_command);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> SilenceClientSocketInterface for client::Socket<'s> {}
