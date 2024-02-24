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
use flex_chat_client::{Client, Origin, Socket};
use flex_chat_macro::command_response;

use flex_chat_client::ClientSocketInterface;

command_response! {
	struct KICK
	{
		/// Le salon que le client DOIT quitter, car victime d'un KICK.
		channel: &'a str,
		/// Raison du kick.
		reason: Option<&'a str>,
		/// La victime.
		knick: &'a Origin<Client>,
	}
}

// --------- //
// Interface //
// --------- //

pub trait KickChannelClientSocketCommandResponseInterface: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client les réponses liées à la commande /KICK.
	fn emit_kick(&self, channel: &Self::Channel, knick_client_socket: &Self, reason: Option<&str>);

	/// Émet au client les réponses liées à la commande /KICK.
	fn emit_self_kick(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		knick_client_socket: &Self,
		reason: Option<&str>,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> KickChannelClientSocketCommandResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn emit_kick(&self, channel: &Self::Channel, knick_client_socket: &Self, reason: Option<&str>)
	{
		let origin = Origin::from(self.client());
		let knick_origin = Origin::from(knick_client_socket.client());

		let cmd_kick = KickCommandResponse {
			origin: &origin,
			knick: &knick_origin,
			channel: &channel.name,
			reason: reason.or(Some("Kick!")),
			tags: KickCommandResponse::default_tags(),
		};

		self.emit_within(channel.room(), cmd_kick.name(), cmd_kick);
		_ = knick_client_socket.socket().leave(channel.room());
	}

	fn emit_self_kick(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		knick_client_socket: &Self,
		reason: Option<&str>,
	)
	{
		let origin = Origin::from(self.client());
		let knick_origin = Origin::from(knick_client_socket.client());

		let cmd_kick = KickCommandResponse {
			origin: &origin,
			knick: &knick_origin,
			channel,
			reason: reason.or(Some("Kick!")),
			tags: KickCommandResponse::default_tags(),
		};

		let room = format!("channel:{}", channel.to_lowercase());
		self.emit_within(room.clone(), cmd_kick.name(), cmd_kick);
		_ = knick_client_socket.socket().leave(room);
	}
}
