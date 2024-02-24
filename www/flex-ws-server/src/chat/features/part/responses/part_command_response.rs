// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{Channel, ChannelInterface};
use flex_chat_client::{ClientSocketInterface, Origin, Socket};
use flex_chat_macro::command_response;

command_response! {
	struct PART
	{
		/// Les salons que le client DOIT quitter.
		channel: &'a str,
		/// Raison du message.
		message: Option<&'a str>,
		/// Par qui l'utilisateur a été forcé de quitter le salon.
		forced_by: Option<&'a str>,
	}
}

// --------- //
// Interface //
// --------- //

pub trait PartClientSocketCommandResponseInterface: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client les réponses liées à la commande /PART.
	fn emit_part<S>(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		message: Option<S>,
		forced_by: Option<&str>,
	) where
		S: std::ops::Deref<Target = str>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> PartClientSocketCommandResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn emit_part<S>(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		message: Option<S>,
		forced_by: Option<&str>,
	) where
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
