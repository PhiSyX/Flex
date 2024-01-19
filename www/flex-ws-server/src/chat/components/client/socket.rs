// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::channel;

// --------- //
// Interface //
// --------- //

pub trait ClientSocketInterface
{
	fn client(&self) -> &super::Client;
	fn client_mut(&mut self) -> &mut super::Client;
	fn socket(&self) -> &socketioxide::extract::SocketRef;
	fn user(&self) -> &crate::src::chat::components::User;
	fn user_mut(&mut self) -> &mut crate::src::chat::components::User;
}

pub trait ClientSocketCommunication {}

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
	pub fn sid(&self) -> socketioxide::socket::Sid
	{
		self.client().sid()
	}
}

impl<'a> Socket<'a>
{
	/// Émet au client les réponses liées à la commande /JOIN.
	pub fn emit_join(
		&self,
		channel: &channel::Channel,
		forced: bool,
		map_member: impl FnMut(
			&channel::nick::ChannelNick,
		) -> Option<crate::src::chat::replies::ChannelNickClient>,
	)
	{
		use crate::src::chat::features::JoinCommandResponse;

		// NOTE: Émettre la réponse de la commande JOIN à tous les membres de la
		// room, y compris le client courant lui-même.
		let cmd_join = JoinCommandResponse {
			origin: Some(self.user()),
			channel: &channel.name,
			forced,
			tags: JoinCommandResponse::default_tags(),
		};

		let channel_room = format!("channel:{}", channel.name.to_lowercase());
		_ = self.socket().join(channel_room.clone());
		_ = self.socket().emit(cmd_join.name(), &cmd_join);
		_ = self
			.socket()
			.to(channel_room)
			.emit(cmd_join.name(), cmd_join);

		// TODO: Émettre le sujet du salon au client courant.
		// TODO: Émettre les paramètres du salon au client courant.

		// NOTE: Émettre au client courant les membres du salon.
		self.send_rpl_namreply(channel, map_member);
	}

	/// Émet au client les réponses liées à la commande /NICK.
	pub fn emit_nick(&self)
	{
		use crate::src::chat::features::NickCommandResponse;

		let (old_nickname, new_nickname): (&str, &str) = (
			self.user().old_nickname.as_deref().unwrap(),
			self.user().nickname.as_ref(),
		);

		let cmd_nick = NickCommandResponse {
			origin: Some(self.user()),
			tags: NickCommandResponse::default_tags(),
			old_nickname,
			new_nickname,
		}
		.with_tags([("userid", self.cid())]);

		_ = self
			.socket()
			.join(format!("private:{}", new_nickname.to_lowercase()));

		// NOTE: notifier toutes les rooms dont fait partie le client que le
		// pseudonyme du client a été changé.

		// FIXME(phisyx): À améliorer pour n'envoyer qu'une seul événement à
		// tous les client en communs.
		for room in self.socket().rooms().unwrap() {
			_ = self.socket().within(room).emit(cmd_nick.name(), &cmd_nick);
		}

		_ = self
			.socket()
			.leave(format!("private:{}", old_nickname.to_lowercase()));
	}

	/// Émet au client les réponses liées à la commande /PART.
	pub fn emit_part(&self, channel: &str, message: Option<&str>)
	{
		use crate::src::chat::features::PartCommandResponse;

		let cmd_part = PartCommandResponse {
			origin: Some(self.user()),
			channel,
			message,
			tags: PartCommandResponse::default_tags(),
		};

		let channel_room = format!("channel:{}", channel.to_lowercase());
		_ = self.socket().emit(cmd_part.name(), &cmd_part);
		_ = self
			.socket()
			.to(channel_room.clone())
			.emit(cmd_part.name(), cmd_part);
		_ = self.socket().leave(channel_room);
	}

	/// Émet au client les réponses liées à la commande /QUIT.
	pub fn emit_quit(self, reason: impl ToString)
	{
		use crate::src::chat::features::QuitCommandResponse;

		let msg = reason.to_string();

		let quit_command = QuitCommandResponse {
			origin: Some(self.user()),
			tags: QuitCommandResponse::default_tags(),
			message: msg.as_str(),
		};

		_ = self
			.socket()
			.broadcast()
			.emit(quit_command.name(), quit_command);
	}
}

impl<'a> Socket<'a>
{
	/// Émet au client les membres d'un salon par chunk de 300.
	pub fn send_rpl_namreply(
		&self,
		channel: &channel::Channel,
		mut map_member: impl FnMut(
			&channel::nick::ChannelNick,
		) -> Option<crate::src::chat::replies::ChannelNickClient>,
	)
	{
		use crate::src::chat::replies::{RplEndofnamesReply, RplNamreplyCommandResponse};

		let rpl_names = Vec::from_iter(channel.members());
		let rpl_names = rpl_names.chunks(300).map(|members| {
			RplNamreplyCommandResponse {
				origin: Some(self.user()),
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
			_ = self.socket().emit(rpl_name.name(), rpl_name);
		}

		let rpl_endofnames = RplEndofnamesReply {
			origin: Some(self.user()),
			channel: &channel.name,
			tags: RplEndofnamesReply::default_tags(),
		};
		_ = self.socket().emit(rpl_endofnames.name(), rpl_endofnames);
	}
}

impl<'a> Socket<'a>
{
	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrAlreadyregisteredError].
	pub fn send_err_alreadyregistered(&self)
	{
		use crate::src::chat::replies::ErrAlreadyregisteredError;

		let err_alreadyregistered = ErrAlreadyregisteredError {
			origin: Some(self.user()),
			tags: ErrAlreadyregisteredError::default_tags(),
		};

		_ = self
			.socket()
			.emit(err_alreadyregistered.name(), err_alreadyregistered);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrBadchannelkeyError].
	pub fn send_err_badchannelkey(&self, channel: &str)
	{
		use crate::src::chat::replies::ErrBadchannelkeyError;

		let err_badchannelkey = ErrBadchannelkeyError {
			channel,
			tags: ErrBadchannelkeyError::default_tags(),
			origin: Some(self.user()),
		};
		_ = self
			.socket()
			.emit(err_badchannelkey.name(), err_badchannelkey);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrErroneusnicknameError].
	pub fn send_err_erroneusnickname(&self, nickname: &str)
	{
		use crate::src::chat::replies::ErrErroneusnicknameError;

		let err_erroneusnickname = ErrErroneusnicknameError {
			origin: Some(self.user()),
			nickname,
			tags: ErrErroneusnicknameError::default_tags(),
		};

		_ = self
			.socket()
			.emit(err_erroneusnickname.name(), err_erroneusnickname);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNicknameinuseError].
	pub fn send_err_nicknameinuse(&self, nickname: &str)
	{
		use crate::src::chat::replies::ErrNicknameinuseError;

		let err_nicknameinuse = ErrNicknameinuseError {
			origin: Some(self.user()),
			nickname,
			tags: ErrNicknameinuseError::default_tags(),
		};

		_ = self
			.socket()
			.emit(err_nicknameinuse.name(), err_nicknameinuse);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNosuchchannelError].
	pub fn send_err_nosuchchannel(&self, channel_name: &str)
	{
		use crate::src::chat::replies::ErrNosuchchannelError;

		let err_nosuchchannel = ErrNosuchchannelError {
			origin: Some(self.user()),
			channel_name,
			tags: ErrNosuchchannelError::default_tags(),
		};
		_ = self
			.socket()
			.emit(err_nosuchchannel.name(), err_nosuchchannel);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNotonchannelError].
	pub fn send_err_notonchannel(&self, channel: &str)
	{
		use crate::src::chat::replies::ErrNotonchannelError;

		let err_notonchannel = ErrNotonchannelError {
			origin: Some(self.user()),
			channel,
			tags: ErrNotonchannelError::default_tags(),
		};
		_ = self
			.socket()
			.emit(err_notonchannel.name(), err_notonchannel);
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
