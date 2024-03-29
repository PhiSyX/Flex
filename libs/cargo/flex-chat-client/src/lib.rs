// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod interface;
mod origin;
mod socket;

use std::collections::HashSet;
use std::net;

use flex_chat_user::{Flag, Mode, User, UserFlagInterface, UserInterface};
use flex_crypto::SHA256;

pub use self::interface::*;
pub use self::origin::*;
pub use self::socket::*;

// ---- //
// Type //
// ---- //

pub type ClientID = uuid::Uuid;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
pub struct Client
{
	/// ID du client.
	id: ClientID,
	/// ID de la Socket.
	socket_id: Option<socketioxide::socket::Sid>,
	/// Enregistré au serveur de Chat.
	registered: bool,
	/// Connecté au serveur de Chat?
	connected: bool,
	/// Jeton de session
	token: String,
	/// Structure utilisateur au client.
	user: User,
	/// Les salons qu'à rejoint le client.
	pub channels: HashSet<String>,
}

// -------------- //
// Implémentation //
// -------------- //

impl Client
{
	/// Crée une nouvelle structure d'un [client](Self).
	pub fn new(ip: net::IpAddr, socket_id: socketioxide::socket::Sid) -> Self
	{
		let client_id = uuid::Uuid::new_v4();
		let token = format!("{}:{}:{}", client_id, socket_id, ip).sha256();
		Self {
			socket_id: Some(socket_id),
			connected: Default::default(),
			id: client_id,
			token,
			registered: Default::default(),
			user: User::new(ip),
			channels: Default::default(),
		}
	}

	/// Applique un ID au client.
	pub fn with_id(mut self, id: uuid::Uuid) -> Self
	{
		self.id = id;
		self
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ClientInterface for Client
{
	type ClientID = ClientID;
	type SocketID = socketioxide::socket::Sid;
	type User = User;

	fn channels(&self) -> &std::collections::HashSet<String>
	{
		&self.channels
	}

	fn cid(&self) -> &Self::ClientID
	{
		&self.id
	}

	fn disconnect(&mut self)
	{
		self.socket_id = None;
		self.connected = false;
	}

	fn has_channel(&self, channel_name: &str) -> bool
	{
		self.channels.contains(channel_name)
	}

	fn is_connected(&self) -> bool
	{
		self.connected
	}

	fn is_registered(&self) -> bool
	{
		self.registered
	}

	fn marks_client_as_operator<F>(
		&mut self,
		oper_type: impl Into<<Self::User as UserFlagInterface>::Flag>,
		oper_flags: impl IntoIterator<Item = F>,
	) where
		F: Into<<Self::User as UserFlagInterface>::Flag>,
	{
		self.user
			.set_flag(Mode::new(oper_type.into()).with_update_by(self.user.nickname()));
		for flag in oper_flags {
			self.user.set_flag(Mode::new(flag.into()));
		}
	}

	fn marks_user_as_away(&mut self, text: impl ToString)
	{
		self.user
			.set_flag(Mode::new(Flag::Away(text.to_string())).with_update_by(self.user.nickname()));
	}

	fn marks_user_as_no_longer_away(&mut self)
	{
		self.user.unset_flag(|flag| matches!(flag, Flag::Away(_)));
	}

	fn maybe_sid(&self) -> Option<&Self::SocketID>
	{
		self.socket_id.as_ref()
	}

	fn private_room(&self) -> String
	{
		format!("private:{}", self.user.nickname().to_lowercase())
	}

	fn reconnect_with_new_sid(&mut self, sid: socketioxide::socket::Sid)
	{
		self.socket_id.replace(sid);
	}

	fn set_sid(&mut self, sid: socketioxide::socket::Sid)
	{
		self.socket_id.replace(sid);
	}

	fn set_connected(&mut self)
	{
		self.connected = true;
	}

	fn set_vhost(&mut self, vhost: impl ToString)
	{
		self.user.set_vhost(vhost)
	}

	fn set_registered(&mut self)
	{
		self.registered = true;
	}

	fn sid(&self) -> &Self::SocketID
	{
		self.socket_id.as_ref().unwrap()
	}

	fn token(&self) -> &str
	{
		&self.token
	}

	fn user(&self) -> &Self::User
	{
		&self.user
	}

	fn user_mut(&mut self) -> &mut Self::User
	{
		&mut self.user
	}
}
