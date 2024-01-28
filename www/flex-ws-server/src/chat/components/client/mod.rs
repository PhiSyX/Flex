// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod origin;
mod socket;

use std::collections::HashSet;
use std::net;

use flex_web_framework::types::uuid;

pub use self::origin::Origin;
pub use self::socket::{ClientSocketInterface, Socket};
use super::{channel, user};
use crate::config::flex;
use crate::src::chat::features::ApplyMode;

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
	pub fn sid(&self) -> Option<socketioxide::socket::Sid>
	{
		self.socket_id
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
	/// Est-ce que le client a comme salon, un salon donné, dans sa liste des
	/// salons rejoint.
	pub fn has_channel(&self, channel_name: &str) -> bool
	{
		self.channels.contains(channel_name)
	}

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

	/// Marque le client comme étant absent.
	pub fn marks_user_as_away(&mut self, text: String)
	{
		self.user.set_flag(
			ApplyMode::new(super::Flag::Away(text)).with_update_by(&self.user().nickname),
		);
	}

	/// Marque le client comme n'étant plus absent.
	pub fn marks_user_as_no_longer_away(&mut self)
	{
		self.user
			.unset_flag(|flag| matches!(flag, super::Flag::Away(_)));
	}

	/// Marque le client comme étant un opérateur.
	pub fn marks_client_as_operator(&mut self, oper_type: flex::flex_config_operator_type)
	{
		self.user.set_flag(
			ApplyMode::new(match oper_type {
				| flex::flex_config_operator_type::GlobalOperator => super::Flag::GlobalOperator,
				| flex::flex_config_operator_type::LocalOperator => super::Flag::LocalOperator,
			})
			.with_update_by(&self.user().nickname),
		)
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

	/// Définit un hôte virtuel pour l'utilisateur.
	pub fn set_vhost(&mut self, vhost: impl ToString)
	{
		self.user.set_vhost(vhost)
	}

	/// Définit le client comme étant enregistré.
	pub fn set_registered(&mut self)
	{
		self.registered = true;
	}
}
