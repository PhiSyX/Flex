// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{Channel, ChannelInterface, ChannelMemberInterface};
use flex_chat::client::channel::errors::{
	ErrChanoprivsneededError,
	ErrNosuchchannelError,
	ErrNotonchannelError,
	ErrUsernotinchannelError,
	ErrUseronchannelError,
};
use flex_chat::client::channel::responses::{
	ChannelClientSocketCommandResponse,
	ChannelClientSocketErrorReplies,
	RplEndofnamesReply,
	RplNamreplyCommandResponse,
};
use flex_chat::client::nick::errors::ErrNosuchnickError;
use flex_chat::client::nick::responses::NickClientSocketErrorReplies;
use flex_chat::client::{ClientInterface, ClientSocketInterface, Origin};
use flex_chat::user::UserInterface;
use tracing::instrument;

use crate::client::Client;

// ----------- //
// Énumération //
// ----------- //

pub enum Socket<'a>
{
	Owned
	{
		socket: socketioxide::extract::SocketRef,
		client: Box<Client>,
	},
	Borrowed
	{
		socket: &'a socketioxide::extract::SocketRef,
		client: socketioxide::extensions::Ref<'a, Client>,
	},
	BorrowedMut
	{
		socket: &'a socketioxide::extract::SocketRef,
		client: socketioxide::extensions::RefMut<'a, Client>,
	},
}

// -------------- //
// Implémentation //
// -------------- //

impl<'a> Socket<'a>
{
	/// Les salons de la socket.
	pub fn channels_rooms(&self) -> Vec<String>
	{
		self.socket()
			.rooms()
			.iter()
			.flatten()
			.filter_map(|room| {
				room.starts_with("channel:").then_some(room.to_string())
			})
			.collect()
	}

	/// Vérifie si le pseudonyme donné est le même que celui sauvegardé dans
	/// l'instance du client courant.
	pub fn has_same_nickname(&self, nickname: &str) -> bool
	{
		self.user().is_itself(nickname)
	}
}

impl<'a> Socket<'a>
{
	pub fn send_err(&self, comment: impl ToString)
	{
		self.emit("ERROR", comment.to_string());
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ClientSocketInterface for Socket<'s>
{
	type Client = Client;
	type Socket = socketioxide::extract::SocketRef;

	#[instrument(name = "ClientSocketInterface::broadcast", skip(self))]
	fn broadcast<E, S>(&self, event: E, data: S)
	where
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self.socket().broadcast().emit(event.to_string(), data);
	}

	#[instrument(name = "ClientSocketInterface::emit", skip(self))]
	fn emit<E, S>(&self, event: E, data: S)
	where
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self.socket().emit(event.to_string(), data);
	}

	#[instrument(name = "ClientSocketInterface::emit_to", skip(self))]
	fn emit_to<T, E, S>(&self, to: T, event: E, data: S)
	where
		T: ToString + std::fmt::Debug,
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self
			.socket()
			.to(to.to_string())
			.emit(event.to_string(), data);
	}

	#[instrument(name = "ClientSocketInterface::emit_within", skip(self))]
	fn emit_within<T, E, S>(&self, to: T, event: E, data: S)
	where
		T: ToString + std::fmt::Debug,
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self
			.socket()
			.within(to.to_string())
			.emit(event.to_string(), data);
	}

	fn client(&self) -> &Self::Client
	{
		match self {
			| Self::Owned { client, .. } => client,
			| Self::Borrowed { client, .. } => client,
			| Self::BorrowedMut { client, .. } => client,
		}
	}

	fn client_mut(&mut self) -> &mut Self::Client
	{
		match self {
			| Self::BorrowedMut { client, .. } => client,
			| Self::Owned { .. } | Self::Borrowed { .. } => {
				panic!("Le client NE PEUT PAS être mutable")
			}
		}
	}

	fn disconnect(self)
	{
		_ = match self {
			| Self::Owned { socket, .. } => socket.disconnect(),
			| Self::Borrowed { .. } | Self::BorrowedMut { .. } => {
				panic!("Impossible de déconnecter cette socket.")
			}
		}
	}

	fn socket(&self) -> &Self::Socket
	{
		match self {
			| Self::Owned { socket, .. } => socket,
			| Self::Borrowed { socket, .. } => socket,
			| Self::BorrowedMut { socket, .. } => socket,
		}
	}

	fn user(&self) -> &<Self::Client as ClientInterface>::User
	{
		self.client().user()
	}

	fn user_mut(&mut self) -> &mut <Self::Client as ClientInterface>::User
	{
		self.client_mut().user_mut()
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'a> ChannelClientSocketCommandResponse for Socket<'a>
{
	type Channel = Channel<uuid::Uuid>;

	fn send_rpl_namreply<DTO>(
		&self,
		channel: &Self::Channel,
		mut map_member: impl FnMut(
			&<Self::Channel as ChannelMemberInterface>::Member,
		) -> Option<DTO>,
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
	type Channel = Channel<uuid::Uuid>;

	fn send_err_chanoprivsneeded(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	)
	{
		let origin = Origin::from(self.client());
		let err_chanoprivsneeded = ErrChanoprivsneededError {
			channel,
			origin: &origin,
			tags: ErrChanoprivsneededError::default_tags(),
		};
		self.emit(err_chanoprivsneeded.name(), err_chanoprivsneeded);
	}

	fn send_err_nosuchchannel(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	)
	{
		let origin = Origin::from(self.client());
		let err_nosuchchannel = ErrNosuchchannelError {
			origin: &origin,
			channel_name: channel,
			tags: ErrNosuchchannelError::default_tags(),
		};
		self.emit(err_nosuchchannel.name(), err_nosuchchannel);
	}

	fn send_err_notonchannel(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	)
	{
		let origin = Origin::from(self.client());
		let err_notonchannel = ErrNotonchannelError {
			origin: &origin,
			channel,
			tags: ErrNotonchannelError::default_tags(),
		};
		self.emit(err_notonchannel.name(), err_notonchannel);
	}

	fn send_err_usernotinchannel(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		nick: &str,
	)
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

	fn send_err_useronchannel(
		&self,
		user: &str,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	)
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

impl<'a> NickClientSocketErrorReplies for Socket<'a>
{
	fn send_err_nosuchnick(&self, nickname: &str)
	{
		let origin = Origin::from(self.client());
		let err_nosuchnick = ErrNosuchnickError {
			origin: &origin,
			nickname,
			tags: ErrNosuchnickError::default_tags(),
		};
		self.emit(err_nosuchnick.name(), err_nosuchnick);
	}
}
