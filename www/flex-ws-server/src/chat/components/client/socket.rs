// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Interface //
// --------- //

pub trait ClientSocketInterface
{
	fn client(&self) -> &super::Client;
	fn client_mut(&mut self) -> &mut super::Client;
	fn free(self);
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

		self.free()
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

	fn free(self)
	{
		self.socket().extensions.remove::<super::Client>();
		drop(self);
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
