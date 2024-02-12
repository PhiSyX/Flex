// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::PartCommandResponse;
use crate::src::chat::components::{client, ClientSocketInterface, Origin};

// --------- //
// Interface //
// --------- //

pub trait PartChannelClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /PART.
	fn emit_part<S>(&self, channel: &str, message: Option<S>, forced_by: Option<&str>)
	where
		S: std::ops::Deref<Target = str>,
	{
		let origin = Origin::from(self.client());

		let cmd_part = PartCommandResponse {
			origin: &origin,
			channel,
			message: message.as_deref(),
			forced_by,
			tags: PartCommandResponse::default_tags(),
		};

		let channel_room = format!("channel:{}", channel.to_lowercase());
		self.emit(cmd_part.name(), &cmd_part);
		self.emit_to(channel_room.clone(), cmd_part.name(), cmd_part);
		_ = self.socket().leave(channel_room);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> PartChannelClientSocketCommandResponseInterface for client::Socket<'s> {}
