// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::time;
use socketioxide::operators::RoomParam;
use tracing::instrument;

use crate::src::chat::components;
use crate::src::chat::components::client::origin::Origin;

// --------- //
// Interface //
// --------- //

pub trait ClientSocketInterface
{
	fn client(&self) -> &super::Client;
	fn client_mut(&mut self) -> &mut super::Client;

	fn disconnect(self);

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
		T: RoomParam + std::fmt::Debug,
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self.socket().to(to).emit(event.to_string(), data);
	}

	#[instrument(name = "ClientSocketInterface::emit_within", skip(self))]
	fn emit_within<T, E, S>(&self, to: T, event: E, data: S)
	where
		T: RoomParam + std::fmt::Debug,
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self.socket().within(to).emit(event.to_string(), data);
	}

	fn socket(&self) -> &socketioxide::extract::SocketRef;
	fn user(&self) -> &crate::src::chat::components::User;
	fn user_mut(&mut self) -> &mut crate::src::chat::components::User;

	/// La chambre des ignorés/bloqués du client courant.
	fn useless_people_room(&self) -> String
	{
		format!("{}/ignore", self.client().cid())
	}
}

// ----------- //
// Énumération //
// ----------- //

pub enum Socket<'a>
{
	Owned
	{
		socket: socketioxide::extract::SocketRef,
		client: Box<super::Client>,
	},
	Borrowed
	{
		socket: &'a socketioxide::extract::SocketRef,
		client: socketioxide::extensions::Ref<'a, super::Client>,
	},
	BorrowedMut
	{
		socket: &'a socketioxide::extract::SocketRef,
		client: socketioxide::extensions::RefMut<'a, super::Client>,
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
			.filter_map(|room| room.starts_with("channel:").then_some(room.to_string()))
			.collect()
	}

	/// Vérifie si le pseudonyme donné est le même que celui sauvegardé dans
	/// l'instance du client courant.
	pub fn check_nickname(&self, nickname: &str) -> bool
	{
		self.user().is_me(nickname)
	}

	/// ID du client courant.
	pub fn cid(&self) -> &super::ClientID
	{
		self.client().id()
	}

	/// ID du socket courante.
	pub fn sid(&self) -> Option<socketioxide::socket::Sid>
	{
		self.client().sid()
	}
}

impl<'a> Socket<'a>
{
	/// Émet au client les membres d'un salon par chunk de 300.
	pub fn send_rpl_namreply(
		&self,
		channel: &components::Channel,
		mut map_member: impl FnMut(
			&components::member::ChannelMember,
		) -> Option<crate::src::chat::replies::ChannelMemberDTO>,
	)
	{
		use crate::src::chat::replies::{RplEndofnamesReply, RplNamreplyCommandResponse};

		let origin = Origin::from(self.client());
		let rpl_names = Vec::from_iter(channel.members());
		let rpl_names = rpl_names.chunks(300).map(|members| {
			RplNamreplyCommandResponse {
				origin: &origin,
				channel: channel.name.as_ref(),
				code: RplNamreplyCommandResponse::code(),
				users: members
					.iter()
					.filter_map(|(_, channel_nick)| map_member(channel_nick))
					.collect::<Vec<_>>(),
				tags: RplNamreplyCommandResponse::default_tags(),
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

	/// Émet au client les réponses de connexion. 3) RPL_CREATED
	pub fn send_rpl_created(&self, created_at: time::DateTime<time::Utc>)
	{
		use crate::src::chat::replies::RplCreatedReply;

		let origin = components::Origin::from(self.client());
		let created_003 = RplCreatedReply {
			origin: &origin,
			date: &created_at,
			tags: RplCreatedReply::default_tags(),
		};

		self.emit(created_003.name(), created_003);
	}

	/// Émet au client les réponses de connexion. 2) RPL_YOURHOST
	pub fn send_rpl_yourhost(&self, servername: &str)
	{
		use crate::src::chat::replies::RplYourhostReply;

		let origin = components::Origin::from(self.client());
		let program_version = format!("v{}", env!("CARGO_PKG_VERSION"));
		let yourhost_002 = RplYourhostReply {
			origin: &origin,
			servername,
			version: &program_version,
			tags: RplYourhostReply::default_tags(),
		};

		self.emit(yourhost_002.name(), yourhost_002);
	}

	/// Émet au client les réponses de connexion. 1) RPL_WELCOME
	pub fn send_rpl_welcome(&self)
	{
		use crate::src::chat::replies::RplWelcomeReply;

		let origin = components::Origin::from(self.client());
		let host = self.user().host.to_string();
		let welcome_001 = RplWelcomeReply {
			origin: &origin,
			nickname: &self.user().nickname,
			ident: &self.user().ident,
			host: &host,
			tags: RplWelcomeReply::default_tags(),
		}
		.with_tags([("client_id", self.client().cid())])
		.with_tags([("token", &self.client().token)]);

		self.emit(welcome_001.name(), welcome_001);
	}
}

impl<'a> Socket<'a>
{
	pub fn send_err(&self, comment: impl ToString)
	{
		self.emit("ERROR", comment.to_string());
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrAlreadyregisteredError].
	pub fn send_err_alreadyregistered(&self)
	{
		use crate::src::chat::replies::ErrAlreadyregisteredError;

		let origin = Origin::from(self.client());
		let err_alreadyregistered = ErrAlreadyregisteredError {
			origin: &origin,
			tags: ErrAlreadyregisteredError::default_tags(),
		};

		self.emit(err_alreadyregistered.name(), err_alreadyregistered);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrChanoprivsneededError].
	pub fn send_err_chanoprivsneeded(&self, channel: &str)
	{
		use crate::src::chat::replies::ErrChanoprivsneededError;

		let origin = Origin::from(self.client());
		let err_chanoprivsneeded = ErrChanoprivsneededError {
			channel,
			origin: &origin,
			tags: ErrChanoprivsneededError::default_tags(),
		};
		self.emit(err_chanoprivsneeded.name(), err_chanoprivsneeded);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNoprivilegesError].
	pub fn send_err_noprivileges(&self)
	{
		use crate::src::chat::replies::ErrNoprivilegesError;

		let origin = Origin::from(self.client());
		let err_noprivileges = ErrNoprivilegesError {
			origin: &origin,
			tags: ErrNoprivilegesError::default_tags(),
		};

		self.emit(err_noprivileges.name(), err_noprivileges);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNosuchchannelError].
	pub fn send_err_nosuchchannel(&self, channel_name: &str)
	{
		use crate::src::chat::replies::ErrNosuchchannelError;

		let origin = Origin::from(self.client());
		let err_nosuchchannel = ErrNosuchchannelError {
			origin: &origin,
			channel_name,
			tags: ErrNosuchchannelError::default_tags(),
		};
		self.emit(err_nosuchchannel.name(), err_nosuchchannel);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNosuchnickError].
	pub fn send_err_nosuchnick(&self, nickname: &str)
	{
		use crate::src::chat::replies::ErrNosuchnickError;

		let origin = Origin::from(self.client());
		let err_nosuchnick = ErrNosuchnickError {
			origin: &origin,
			nickname,
			tags: ErrNosuchnickError::default_tags(),
		};
		self.emit(err_nosuchnick.name(), err_nosuchnick);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNotonchannelError].
	pub fn send_err_notonchannel(&self, channel: &str)
	{
		use crate::src::chat::replies::ErrNotonchannelError;

		let origin = Origin::from(self.client());
		let err_notonchannel = ErrNotonchannelError {
			origin: &origin,
			channel,
			tags: ErrNotonchannelError::default_tags(),
		};
		self.emit(err_notonchannel.name(), err_notonchannel);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrUsernotinchannelError].
	pub fn send_err_usernotinchannel(&self, channel: &str, nick: &str)
	{
		use crate::src::chat::replies::ErrUsernotinchannelError;

		let origin = Origin::from(self.client());
		let err_usernotinchannel = ErrUsernotinchannelError {
			origin: &origin,
			tags: ErrUsernotinchannelError::default_tags(),
			channel,
			nick,
		};

		self.emit(err_usernotinchannel.name(), err_usernotinchannel);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrUseronchannelError].
	pub fn send_err_useronchannel(&self, user: &str, channel: &str)
	{
		use crate::src::chat::replies::ErrUseronchannelError;

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

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'a> ClientSocketInterface for Socket<'a>
{
	fn client(&self) -> &super::Client
	{
		match self {
			| Self::Owned { client, .. } => client,
			| Self::Borrowed { client, .. } => client,
			| Self::BorrowedMut { client, .. } => client,
		}
	}

	fn client_mut(&mut self) -> &mut super::Client
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

	fn socket(&self) -> &socketioxide::extract::SocketRef
	{
		match self {
			| Self::Owned { socket, .. } => socket,
			| Self::Borrowed { socket, .. } => socket,
			| Self::BorrowedMut { socket, .. } => socket,
		}
	}

	fn user(&self) -> &crate::src::chat::components::User
	{
		&self.client().user
	}

	fn user_mut(&mut self) -> &mut crate::src::chat::components::user::User
	{
		&mut self.client_mut().user
	}
}
