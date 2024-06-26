// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{Channel, ChannelInterface};
use flex_chat::client::{ClientSocketInterface, Origin, Socket};
use flex_chat::macros::command_response;

command_response! {
	struct JOIN<'channel>
	{
		/// Les salons que le client DOIT rejoindre.
		channel: &'channel str,
		/// Est-ce que le client a été forcé de rejoindre ces salons?
		///
		/// NOTE: Seuls les admins peuvent forcer un client de rejoindre un
		/// salon.
		forced: bool,
	}
}

// --------- //
// Interface //
// --------- //

pub trait JoinCommandResponseInterface
	: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client la réponse liée à la commande /JOIN.
	fn emit_join(&self, channel: &Self::Channel, forced: bool);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> JoinCommandResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn emit_join(&self, channel: &Self::Channel, forced: bool)
	{
		let origin = Origin::from(self.client());

		// NOTE: Émettre la réponse de la commande JOIN à tous les membres de la
		// room, y compris le client courant lui-même.
		let cmd_join = JoinCommandResponse {
			origin: &origin,
			channel: channel.name(),
			forced,
			tags: JoinCommandResponse::default_tags(),
		};

		_ = self.socket().join(channel.room());
		self.emit(cmd_join.name(), &cmd_join);
		self.emit_to(channel.room(), cmd_join.name(), cmd_join);
	}
}
