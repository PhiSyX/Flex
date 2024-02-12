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

use super::ErrBadchannelkeyError;
use crate::src::chat::components;
use crate::src::chat::components::client::{self, ClientSocketInterface};
use crate::src::chat::features::{
	ModeChannelSettingsClientSocketCommandResponseInterface,
	TopicClientSocketInterface,
};

// --------- //
// Interface //
// --------- //

pub trait JoinChannelClientSocketCommandResponseInterface
{
	/// Émet au client les réponses liées à la commande /JOIN.
	fn emit_join(
		&self,
		channel: &components::Channel,
		forced: bool,
		map_member: impl FnMut(
			&components::member::ChannelMember,
		) -> Option<crate::src::chat::replies::ChannelMemberDTO>,
	);
}

pub trait JoinChannelClientSocketErrorRepliesInterface: ClientSocketInterface
{
	/// Émet au client l'erreur [ErrBadchannelkeyError].
	fn send_err_badchannelkey(&self, channel: impl AsRef<str>)
	{
		let origin = Origin::from(self.client());
		let err_badchannelkey = ErrBadchannelkeyError {
			channel: channel.as_ref(),
			tags: ErrBadchannelkeyError::default_tags(),
			origin: &origin,
		};
		self.emit(err_badchannelkey.name(), err_badchannelkey);
	}

	// TODO: ERR_CHANNELISFULL
	#[allow(dead_code)]
	fn send_err_channelisfull(&self) {}

	// TODO: ERR_TOOMANYCHANNELS
	#[allow(dead_code)]
	fn send_err_toomanychannels(&self) {}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> JoinChannelClientSocketCommandResponseInterface for client::Socket<'s>
{
	fn emit_join(
		&self,
		channel: &components::Channel,
		forced: bool,
		map_member: impl FnMut(
			&components::member::ChannelMember,
		) -> Option<crate::src::chat::replies::ChannelMemberDTO>,
	)
	{
		use crate::src::chat::features::JoinCommandResponse;

		let origin = Origin::from(self.client());

		// NOTE: Émettre la réponse de la commande JOIN à tous les membres de la
		// room, y compris le client courant lui-même.
		let cmd_join = JoinCommandResponse {
			origin: &origin,
			channel: &channel.name,
			forced,
			tags: JoinCommandResponse::default_tags(),
		};

		_ = self.socket().join(channel.room());
		self.emit(cmd_join.name(), &cmd_join);
		self.emit_to(channel.room(), cmd_join.name(), cmd_join);

		// NOTE: Émettre le sujet du salon au client courant.
		self.send_rpl_topic(channel, false);

		// NOTE: Émettre les paramètres du salon au client courant.
		self.emit_all_channels_settings(channel, false);

		// NOTE: Émettre au client courant les membres du salon.
		self.send_rpl_namreply(channel, map_member);
	}
}

impl<'s> JoinChannelClientSocketErrorRepliesInterface for client::Socket<'s> {}
