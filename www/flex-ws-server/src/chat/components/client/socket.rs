// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::client::origin::Origin;
use crate::src::chat::components::{self};

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

	/// La chambre des ignorés/bloqués du client courant.
	pub fn useless_people_room(&self) -> String
	{
		format!("{}/ignore", self.cid())
	}
}

impl<'a> Socket<'a>
{
	/// Émet au client les réponses liées à la commande /JOIN.
	pub fn emit_join(
		&self,
		channel: &components::Channel,
		forced: bool,
		map_member: impl FnMut(
			&components::nick::ChannelNick,
		) -> Option<crate::src::chat::replies::ChannelNickClient>,
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

		let origin = Origin::from(self.client());

		let cmd_nick = NickCommandResponse {
			origin: &origin,
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

		_ = self.socket().emit(cmd_nick.name(), &cmd_nick);
		// FIXME(phisyx): À améliorer pour n'envoyer qu'une seul événement à
		// tous les client en communs.
		_ = self.socket().broadcast().emit(cmd_nick.name(), &cmd_nick);

		_ = self
			.socket()
			.leave(format!("private:{}", old_nickname.to_lowercase()));
	}

	/// Émet au client les réponses liées à la commande /PART.
	pub fn emit_part(&self, channel: &str, message: Option<&str>)
	{
		use crate::src::chat::features::PartCommandResponse;

		let origin = Origin::from(self.client());

		let cmd_part = PartCommandResponse {
			origin: &origin,
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

	/// Émet au client les réponses liées à la commande /PRIVMSG <channel>
	pub fn emit_privmsg_to_channel<User>(&self, target: &str, text: &str, by: User)
	where
		User: serde::Serialize,
	{
		use crate::src::chat::features::PrivmsgCommandResponse;

		let privmsg = PrivmsgCommandResponse {
			origin: &by,
			tags: PrivmsgCommandResponse::default_tags(),
			target,
			text,
		};

		_ = self.socket().emit(privmsg.name(), &privmsg);

		let target_room = format!(
			"{}:{}",
			if target.starts_with('#') {
				"channel"
			} else {
				"private"
			},
			target.to_lowercase()
		);

		_ = self
			.socket()
			.except(self.useless_people_room())
			.to(target_room)
			.emit(privmsg.name(), privmsg);
	}

	/// Émet au client les réponses liées à la commande /PRIVMSG <nickname>
	pub fn emit_privmsg_to_nickname<User>(&self, target: &str, text: &str, by: User)
	where
		User: serde::Serialize,
	{
		use crate::src::chat::features::PrivmsgCommandResponse;

		let privmsg = PrivmsgCommandResponse {
			origin: &by,
			target,
			text,
			tags: PrivmsgCommandResponse::default_tags(),
		};

		_ = self.socket().emit(privmsg.name(), &privmsg);
	}

	/// Émet au client les réponses liées à la commande /QUIT.
	pub fn emit_quit(self, reason: impl ToString)
	{
		use crate::src::chat::features::QuitCommandResponse;

		let msg = reason.to_string();

		let origin = Origin::from(self.client());
		let quit_command = QuitCommandResponse {
			origin: &origin,
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
	/// Émet au client les réponses liées à la commande /IGNORE.
	pub fn send_rpl_ignore(&self, users: &[&components::User], updated: bool)
	{
		use crate::src::chat::features::RplIgnoreReply;

		let origin = Origin::from(self.client());
		let rpl_ignore = RplIgnoreReply {
			origin: &origin,
			users,
			tags: RplIgnoreReply::default_tags(),
			updated: &updated,
		};
		_ = self.socket().emit(rpl_ignore.name(), rpl_ignore);
	}

	/// Émet au client les membres d'un salon par chunk de 300.
	pub fn send_rpl_namreply(
		&self,
		channel: &components::Channel,
		mut map_member: impl FnMut(
			&components::nick::ChannelNick,
		) -> Option<crate::src::chat::replies::ChannelNickClient>,
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
			_ = self.socket().emit(rpl_name.name(), rpl_name);
		}

		let rpl_endofnames = RplEndofnamesReply {
			origin: &origin,
			channel: &channel.name,
			tags: RplEndofnamesReply::default_tags(),
		};
		_ = self.socket().emit(rpl_endofnames.name(), rpl_endofnames);
	}

	/// Émet au client les réponses liées à la commande /UNIGNORE.
	pub fn send_rpl_unignore(&self, users: &[&components::User])
	{
		use crate::src::chat::features::RplUnignoreReply;

		let origin = Origin::from(self.client());
		let rpl_unignore = RplUnignoreReply {
			origin: &origin,
			users,
			tags: RplUnignoreReply::default_tags(),
		};
		_ = self.socket().emit(rpl_unignore.name(), rpl_unignore);
	}
}

impl<'a> Socket<'a>
{
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

		_ = self
			.socket()
			.emit(err_alreadyregistered.name(), err_alreadyregistered);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrBadchannelkeyError].
	pub fn send_err_badchannelkey(&self, channel: &str)
	{
		use crate::src::chat::replies::ErrBadchannelkeyError;

		let origin = Origin::from(self.client());
		let err_badchannelkey = ErrBadchannelkeyError {
			channel,
			tags: ErrBadchannelkeyError::default_tags(),
			origin: &origin,
		};
		_ = self
			.socket()
			.emit(err_badchannelkey.name(), err_badchannelkey);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrCannotsendtochanError].
	pub fn send_err_cannotsendtochan(&self, channel_name: &str)
	{
		use crate::src::chat::replies::ErrCannotsendtochanError;

		let origin = Origin::from(self.client());
		let err_cannotsendtochan = ErrCannotsendtochanError {
			channel_name,
			origin: &origin,
			tags: ErrCannotsendtochanError::default_tags(),
		};
		_ = self
			.socket()
			.emit(err_cannotsendtochan.name(), err_cannotsendtochan);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrErroneusnicknameError].
	pub fn send_err_erroneusnickname(&self, nickname: &str)
	{
		use crate::src::chat::replies::ErrErroneusnicknameError;

		let origin = Origin::from(self.client());
		let err_erroneusnickname = ErrErroneusnicknameError {
			origin: &origin,
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

		let origin = Origin::from(self.client());
		let err_nicknameinuse = ErrNicknameinuseError {
			origin: &origin,
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

		let origin = Origin::from(self.client());
		let err_nosuchchannel = ErrNosuchchannelError {
			origin: &origin,
			channel_name,
			tags: ErrNosuchchannelError::default_tags(),
		};
		_ = self
			.socket()
			.emit(err_nosuchchannel.name(), err_nosuchchannel);
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
		_ = self.socket().emit(err_nosuchnick.name(), err_nosuchnick);
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
