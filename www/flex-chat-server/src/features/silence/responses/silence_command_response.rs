// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{Client, ClientSocketInterface, Origin, Socket};
use flex_chat_macro::command_response;

command_response! {
	struct SILENCE
	{
		added: bool,
		removed: bool,
		users: &'a [&'a Origin<Client>],
		updated: bool,
	}
}

// --------- //
// Interface //
// --------- //

pub trait SilenceClientSocketInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /SILENCE.
	fn emit_silence(&self, users: &[&Origin<Self::Client>], updated: Option<bool>);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> SilenceClientSocketInterface for Socket<'s>
{
	fn emit_silence(&self, users: &[&Origin<Self::Client>], updated: Option<bool>)
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
