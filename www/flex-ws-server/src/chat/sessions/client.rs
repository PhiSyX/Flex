// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::net;

use dashmap::mapref::multiple::RefMutMulti;
use dashmap::{DashMap, DashSet};
use flex_web_framework::http::request;
use socketioxide::extract::SocketRef;

use crate::src::chat::components::client;
use crate::src::chat::components::client::ClientSocketInterface;
use crate::src::ChatApplication;

// ---- //
// Type //
// ---- //

pub type BlockedByID = client::ClientID;
pub type BlockedID = client::ClientID;

// --------- //
// Structure //
// --------- //

#[derive(Default)]
pub struct ClientsSession
{
	/// Les utilisateurs bloqués pour chaque utilisateur.
	pub blocklist: DashMap<BlockedByID, DashSet<BlockedID>>,
	/// Les clients de session.
	pub clients: DashMap<client::ClientID, client::Client>,
}

// -------------- //
// Implémentation // -> ChatApplication
// -------------- //

impl ChatApplication
{
	/// Crée une nouvelle session d'un client à partir d'une socket.
	pub fn create_client(&self, socket: &SocketRef) -> client::Client
	{
		let request::ConnectInfo(addr) = socket
			.req_parts()
			.extensions
			.get::<request::ConnectInfo<net::SocketAddr>>()
			.expect("Adresse IP de la Socket");
		let sid = socket.id;
		self.clients.create(addr.ip(), sid)
	}

	/// Récupère le client courant (immuable) à partir d'une socket.
	pub fn current_client<'a>(
		&'a self,
		socket: &'a socketioxide::extract::SocketRef,
	) -> client::Socket<'a>
	{
		let client: socketioxide::extensions::Ref<'a, client::Client> =
			socket.extensions.get().unwrap();
		client::Socket::Borrowed { socket, client }
	}

	/// Récupère le client courant (immuable) avec les droits d'opérateurs
	/// globaux / locaux à partir d'une socket.
	pub fn current_client_operator<'a>(
		&'a self,
		socket: &'a socketioxide::extract::SocketRef,
	) -> Option<client::Socket<'a>>
	{
		let client: socketioxide::extensions::Ref<'a, client::Client> =
			socket.extensions.get().unwrap();
		let client_socket = client::Socket::Borrowed { socket, client };

		if !client_socket.user().is_operator() {
			client_socket.send_err_noprivileges();
			return None;
		}

		Some(client_socket)
	}

	/// Récupère le client courant (mutable) à partir d'une socket.
	pub fn current_client_mut<'a>(
		&'a self,
		socket: &'a socketioxide::extract::SocketRef,
	) -> client::Socket<'a>
	{
		let client: socketioxide::extensions::RefMut<'a, client::Client> =
			socket.extensions.get_mut().unwrap();
		client::Socket::BorrowedMut { socket, client }
	}

	/// Cherche un [client::Socket] à partir d'un pseudonyme.
	pub fn find_socket_by_nickname(
		&self,
		socket: &socketioxide::extract::SocketRef,
		nickname: &str,
	) -> Option<client::Socket>
	{
		let to_ignore_client = self.clients.get_by_nickname(nickname)?;
		let to_ignore_socket = socket.broadcast().get_socket(to_ignore_client.sid()?)?;
		Some(client::Socket::Owned {
			client: Box::new(to_ignore_client),
			socket: to_ignore_socket,
		})
	}

	/// Récupère un client à partir de son ID.
	pub fn get_client_by_id(&self, client_id: &client::ClientID) -> Option<client::Client>
	{
		self.clients.get(client_id)
	}

	/// Récupère un client à partir de son ID.
	pub fn get_client_mut_by_id(
		&self,
		client_id: &client::ClientID,
	) -> Option<RefMutMulti<'_, client::ClientID, client::Client>>
	{
		self.clients.get_mut(client_id)
	}

	/// Enregistre le client en session.
	pub fn register_client(&self, client: &client::Client)
	{
		self.clients.upgrade(client);
		self.clients.register(client);
	}
}

// -------------- //
// Implémentation //
// -------------- //

impl ClientsSession
{
	/// Crée une nouvelle session d'un client.
	pub fn create(&self, ip: net::IpAddr, socket_id: socketioxide::socket::Sid) -> client::Client
	{
		let client = client::Client::new(ip, socket_id);
		self.clients.insert(client.cid(), client.clone());
		client
	}

	/// Cherche un client en fonction de son ID.
	pub fn get(&self, client_id: &client::ClientID) -> Option<client::Client>
	{
		self.clients.iter().find_map(|rm| {
			let (cid, client) = (rm.key(), rm.value());
			(cid == client_id && client.is_registered()).then_some(client.clone())
		})
	}

	/// Cherche un client en fonction de son ID.
	pub fn get_mut(
		&self,
		client_id: &client::ClientID,
	) -> Option<dashmap::mapref::multiple::RefMutMulti<'_, client::ClientID, client::Client>>
	{
		self.clients
			.iter_mut()
			.find(|rm| rm.key() == client_id && rm.value().is_registered())
	}

	/// Trouve un client en fonction de son pseudo.
	pub fn get_by_nickname(&self, nickname: &str) -> Option<client::Client>
	{
		let nickname = nickname.to_lowercase();
		self.clients.iter().find_map(|rm| {
			let client = rm.value();
			(client.user().nickname.to_lowercase().eq(&nickname)).then_some(client.clone())
		})
	}

	/// Enregistre un client.
	pub fn register(&self, client: &client::Client)
	{
		let mut session_client = self.clients.get_mut(client.id()).unwrap();
		if let Some(sid) = client.sid() {
			session_client.set_sid(sid);
		}
		session_client.set_connected();
		session_client.set_registered();
	}

	/// Mise à niveau d'un client.
	pub fn upgrade(&self, client: &client::Client)
	{
		self.clients.remove(client.id());
		self.clients.insert(client.cid(), client.clone());
	}
}
