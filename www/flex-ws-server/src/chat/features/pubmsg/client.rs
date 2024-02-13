// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::PubmsgCommandResponse;
use crate::src::chat::components::client::{self, Origin};
use crate::src::chat::components::ClientSocketInterface;
use crate::src::chat::replies::ErrCannotsendtochanError;

// --------- //
// Interface //
// --------- //

pub trait PubmsgClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /PUBMSG <channel>
	fn emit_pubmsg<User>(&self, channel_name: &str, text: &str, by: User, external: bool)
	where
		User: serde::Serialize,
	{
		let pubmsg_command = PubmsgCommandResponse {
			origin: &by,
			tags: PubmsgCommandResponse::default_tags(),
			channel: channel_name,
			text,
			external,
		};

		_ = self.socket().emit(pubmsg_command.name(), &pubmsg_command);

		let target_room = format!("channel:{}", channel_name.to_lowercase());

		_ = self
			.socket()
			.except(self.useless_people_room())
			.to(target_room)
			.emit(pubmsg_command.name(), pubmsg_command);
	}
}

pub trait PubmsgClientSocketErrorRepliesInterface: ClientSocketInterface
{
	/// Émet au client l'erreur [ErrCannotsendtochanError].
	fn send_err_cannotsendtochan(&self, channel_name: &str)
	{
		let origin = Origin::from(self.client());
		let err_cannotsendtochan = ErrCannotsendtochanError {
			channel_name,
			origin: &origin,
			tags: ErrCannotsendtochanError::default_tags(),
		};
		self.emit(err_cannotsendtochan.name(), err_cannotsendtochan);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> PubmsgClientSocketCommandResponseInterface for client::Socket<'s> {}

impl<'s> PubmsgClientSocketErrorRepliesInterface for client::Socket<'s> {}
