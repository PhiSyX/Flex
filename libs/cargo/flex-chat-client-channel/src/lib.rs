// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod errors;
mod responses;

use errors::{ErrNotonchannelError, ErrUsernotinchannelError};
use flex_chat_channel::{
	Channel,
	ChannelInterface,
	ChannelMember,
	ChannelMemberInterface,
};
use flex_chat_client::{ClientSocketInterface, Origin, Socket};
use responses::{RplEndofnamesReply, RplNamreplyCommandResponse};

use self::errors::{
	ErrChanoprivsneededError,
	ErrNosuchchannelError,
	ErrUseronchannelError,
};

// --------- //
// Interface //
// --------- //

pub trait ChannelClientSocketCommandResponse: ClientSocketInterface
{
	/// Émet au client les membres d'un salon par chunk de 300.
	fn send_rpl_namreply<DTO>(
		&self,
		channel: &Channel,
		map_member: impl FnMut(&ChannelMember) -> Option<DTO>,
	) where
		DTO: serde::Serialize + std::fmt::Debug;
}

pub trait ChannelClientSocketErrorReplies: ClientSocketInterface
{
	/// Émet au client l'erreur [crate::ErrChanoprivsneededError].
	fn send_err_chanoprivsneeded(&self, channel: &str);

	/// Émet au client l'erreur [crate::ErrNosuchchannelError].
	fn send_err_nosuchchannel(&self, channel: &str);

	/// Émet au client l'erreur [crate::ErrNotonchannelError].
	fn send_err_notonchannel(&self, channel: &str);

	/// Émet au client l'erreur [crate::ErrUsernotinchannelError].
	fn send_err_usernotinchannel(&self, channel: &str, nick: &str);

	/// Émet au client l'erreur [crate::ErrUseronchannelError].
	fn send_err_useronchannel(&self, user: &str, channel: &str);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'a> ChannelClientSocketCommandResponse for Socket<'a>
{
	fn send_rpl_namreply<DTO>(
		&self,
		channel: &Channel,
		mut map_member: impl FnMut(&ChannelMember) -> Option<DTO>,
	) where
		DTO: serde::Serialize + std::fmt::Debug,
	{
		let origin = Origin::from(self.client());
		let rpl_names = Vec::from_iter(channel.members());
		let rpl_names = rpl_names.chunks(300).map(|members| {
			RplNamreplyCommandResponse {
				origin: &origin,
				channel: channel.name.as_ref(),
				code: RplNamreplyCommandResponse::<DTO>::code(),
				users: members
					.iter()
					.filter_map(|(_, channel_nick)| map_member(channel_nick))
					.collect::<Vec<_>>(),
				tags: RplNamreplyCommandResponse::<DTO>::default_tags(),
			}
		});

		for rpl_name in rpl_names {
			self.emit_within(channel.room(), rpl_name.name(), rpl_name);
		}

		let rpl_endofnames = RplEndofnamesReply {
			origin: &origin,
			channel: &channel.name,
			tags: RplEndofnamesReply::default_tags(),
		};
		self.emit_within(channel.room(), rpl_endofnames.name(), rpl_endofnames);
	}
}

impl<'a> ChannelClientSocketErrorReplies for Socket<'a>
{
	fn send_err_chanoprivsneeded(&self, channel: &str)
	{
		let origin = Origin::from(self.client());
		let err_chanoprivsneeded = ErrChanoprivsneededError {
			channel,
			origin: &origin,
			tags: ErrChanoprivsneededError::default_tags(),
		};
		self.emit(err_chanoprivsneeded.name(), err_chanoprivsneeded);
	}

	fn send_err_nosuchchannel(&self, channel: &str)
	{
		let origin = Origin::from(self.client());
		let err_nosuchchannel = ErrNosuchchannelError {
			origin: &origin,
			channel_name: channel,
			tags: ErrNosuchchannelError::default_tags(),
		};
		self.emit(err_nosuchchannel.name(), err_nosuchchannel);
	}

	fn send_err_notonchannel(&self, channel: &str)
	{
		let origin = Origin::from(self.client());
		let err_notonchannel = ErrNotonchannelError {
			origin: &origin,
			channel,
			tags: ErrNotonchannelError::default_tags(),
		};
		self.emit(err_notonchannel.name(), err_notonchannel);
	}

	fn send_err_usernotinchannel(&self, channel: &str, nick: &str)
	{
		let origin = Origin::from(self.client());
		let err_usernotinchannel = ErrUsernotinchannelError {
			origin: &origin,
			tags: ErrUsernotinchannelError::default_tags(),
			channel,
			nick,
		};

		self.emit(err_usernotinchannel.name(), err_usernotinchannel);
	}

	fn send_err_useronchannel(&self, user: &str, channel: &str)
	{
		let origin = Origin::from(self.client());
		let err_useronchannel = ErrUseronchannelError {
			origin: &origin,
			tags: ErrUseronchannelError::default_tags(),
			user,
			channel,
		};

		self.emit(err_useronchannel.name(), err_useronchannel);
	}
}
