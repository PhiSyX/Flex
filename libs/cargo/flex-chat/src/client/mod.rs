// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

pub mod channel;
mod interface;
pub mod nick;
mod origin;

use core::fmt;
use std::collections::HashSet;
use std::net;

use flex_crypto::SHA256;

pub use self::interface::*;
pub use self::origin::*;
use crate::user::{Flag, Mode, User, UserFlagInterface, UserInterface};

#[derive(Debug)]
#[derive(Clone)]
pub struct Client<cID, sID>
{
	/// ID du client.
	id: cID,
	/// ID de la Socket.
	socket_id: Option<sID>,
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

impl<cID, sID> Client<cID, sID>
{
	/// Crée une nouvelle structure d'un [client](Self).
	pub fn new(ip: net::IpAddr, client_id: cID, socket_id: sID) -> Self
	where
		cID: fmt::Display,
		sID: fmt::Display,
	{
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
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<cID, sID> ClientInterface for Client<cID, sID>
where
	cID: Clone + fmt::Debug + fmt::Display + serde::Serialize,
	sID: fmt::Debug + fmt::Display,
{
	type ClientID = cID;
	type SocketID = sID;
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
		self.user.set_flag(
			Mode::new(oper_type.into()).with_update_by(self.user.nickname()),
		);
		for flag in oper_flags {
			self.user.set_flag(Mode::new(flag.into()));
		}
	}

	fn marks_user_as_away(&mut self, text: impl ToString)
	{
		self.user.set_flag(
			Mode::new(Flag::Away(text.to_string()))
				.with_update_by(self.user.nickname()),
		);
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

	fn reconnect_with_new_sid(&mut self, sid: Self::SocketID)
	{
		self.socket_id.replace(sid);
	}

	fn set_cid(&mut self, cid: Self::ClientID)
	{
		self.id = cid;
	}

	fn set_sid(&mut self, sid: Self::SocketID)
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

	fn new_token(&mut self)
	{
		let ip = self.user().host().ip_addr.expose();
		let token = format!("{}:{}:{}", self.cid(), self.sid(), ip).sha256();
		self.token = token;
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
