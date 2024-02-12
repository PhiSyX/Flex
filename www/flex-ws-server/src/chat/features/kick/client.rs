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

use super::{ErrCannotkickglobopsError, KickCommandResponse};
use crate::src::chat::components;
use crate::src::chat::components::client::{self, ClientSocketInterface};

// --------- //
// Interface //
// --------- //

pub trait KickChannelClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /KICK.
	fn emit_kick(
		&self,
		channel: &components::channel::Channel,
		knick_client_socket: &Self,
		reason: Option<&str>,
	)
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

	/// Émet au client les réponses liées à la commande /KICK.
	fn emit_self_kick(&self, channel: &str, knick_client_socket: &Self, reason: Option<&str>)
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

pub trait KickChannelClientSocketErrorRepliesInterface: ClientSocketInterface
{
	/// Émet au client l'erreur [ErrCannotkickglobopsError].
	fn send_err_cannotkickglobops(&self, channel_name: &str, nickname: &str)
	{
		let origin = Origin::from(self.client());
		let err_cannotsendtochan = ErrCannotkickglobopsError {
			channel: channel_name,
			nick: nickname,
			origin: &origin,
			tags: ErrCannotkickglobopsError::default_tags(),
		};
		self.emit(err_cannotsendtochan.name(), err_cannotsendtochan);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> KickChannelClientSocketCommandResponseInterface for client::Socket<'s> {}

impl<'s> KickChannelClientSocketErrorRepliesInterface for client::Socket<'s> {}
