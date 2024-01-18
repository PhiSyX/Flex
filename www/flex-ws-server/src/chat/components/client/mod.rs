// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod socket;

use std::collections::HashSet;
use std::net;

use flex_web_framework::types::uuid;

pub use self::socket::{ClientSocketInterface, Socket};
use super::{channel, user};

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
	/// Structure utilisateur au client.
	user: user::User,
	/// Les salons qu'à rejoint le client.
	pub channels: HashSet<channel::ChannelID>,
}

// -------------- //
// Implémentation //
// -------------- //

impl Client
{
	/// Crée une nouvelle structure d'un [client](Self).
	pub fn new(ip: net::IpAddr, socket_id: socketioxide::socket::Sid) -> Self
	{
		Self {
			socket_id: Some(socket_id),
			connected: Default::default(),
			id: uuid::Uuid::new_v4(),
			registered: Default::default(),
			user: user::User::new(ip),
			channels: Default::default(),
		}
	}
}

impl Client
{
	/// ID du client.
	pub fn id(&self) -> &ClientID
	{
		&self.id
	}

	/// ID du client.
	pub fn cid(&self) -> ClientID
	{
		self.id
	}

	/// ID de la Socket.
	pub fn sid(&self) -> socketioxide::socket::Sid
	{
		self.socket_id.unwrap()
	}

	/// Utilisateur du client.
	pub fn user(&self) -> &user::User
	{
		&self.user
	}

	/// Utilisateur du client (mutable).
	pub fn user_mut(&mut self) -> &mut user::User
	{
		&mut self.user
	}
}

impl Client
{
	/// Est-ce que le client est connecté du serveur de Chat?
	pub fn is_connected(&self) -> bool
	{
		self.connected
	}

	/// Est-ce que le client est déconnecté du serveur de Chat?
	pub fn is_disconnected(&self) -> bool
	{
		!self.is_connected()
	}

	/// Est-ce que le client est enregistré sur le serveur de Chat?
	pub fn is_registered(&self) -> bool
	{
		self.registered
	}

	/// Chambre privé de l'utilisateur.
	pub fn private_room(&self) -> String
	{
		format!("private:{}", self.user.nickname.to_lowercase())
	}
}

impl Client
{
	/// Met en état de déconnexion le client.
	pub fn disconnect(&mut self)
	{
		self.socket_id = None;
		self.connected = false;
	}

	/// Attribution d'un nouvel ID de Socket.
	pub fn reconnect_with_new_sid(&mut self, sid: socketioxide::socket::Sid)
	{
		self.socket_id.replace(sid);
	}

	/// Attribution d'un nouvel ID de Socket.
	pub fn set_sid(&mut self, sid: socketioxide::socket::Sid)
	{
		self.socket_id.replace(sid);
	}

	/// Définit le client comme étant connecté.
	pub fn set_connected(&mut self)
	{
		self.connected = true;
	}

	/// Définit le client comme étant enregistré.
	pub fn set_registered(&mut self)
	{
		self.registered = true;
	}
}
