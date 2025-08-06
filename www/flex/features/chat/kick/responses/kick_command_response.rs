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
use flex_chat::client::{Client, ClientSocketInterface, Origin, Socket};
use flex_chat::macros::command_response;

command_response! {
	struct KICK<'channel, 'victim, 'reason>
	{
		/// Le salon que le client DOIT quitter, car victime d'un KICK.
		channel: &'channel str,
		/// La victime.
		knick: &'victim Origin<Client>,
		/// Raison du kick.
		reason: Option<&'reason str>,
	}
}

// --------- //
// Interface //
// --------- //

pub trait KickChannelClientSocketCommandResponseInterface:
	ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client courant les réponses liées à la commande /KICK.
	fn emit_kick(
		&self,
		channel: &Self::Channel,
		member_kicked: &Self,
		comment: Option<&str>,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> KickChannelClientSocketCommandResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn emit_kick(
		&self,
		channel: &Self::Channel,
		member_kicked: &Self,
		comment: Option<&str>,
	)
	{
		let origin = Origin::from(self.client());
		let knick_origin = Origin::from(member_kicked.client());

		let cmd_kick = KickCommandResponse {
			origin: &origin,
			knick: &knick_origin,
			channel: channel.name(),
			reason: comment.or(Some("Kick!")),
			tags: KickCommandResponse::default_tags(),
		};

		self.emit_within(channel.room(), cmd_kick.name(), cmd_kick);
		_ = member_kicked.socket().leave(channel.room());
	}
}
