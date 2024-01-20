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

use dashmap::{DashMap, DashSet};
use flex_web_framework::http::request;
use socketioxide::extract::SocketRef;

use crate::src::chat::components::client;
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
	pub(super) blocklist: DashMap<BlockedByID, DashSet<BlockedID>>,
	/// Les clients de session.
	pub(super) clients: DashMap<client::ClientID, client::Client>,
}

// -------------- //
// Implémentation // -> ChatApplication
// -------------- //

impl ChatApplication
{
	/// Ajoute un client (2) à la liste des clients bloqués/ignorés du client
	/// (1).
	pub fn add_client_to_blocklist(
		&self,
		client: &client::Socket,
		to_ignore_client: &client::Socket,
	)
	{
		self.clients
			.add_to_block(client.cid(), to_ignore_client.cid());
	}

	/// Peut-on localiser un client de session via un pseudonyme ?
	pub fn can_locate_client_by_nickname(&self, nickname: &str) -> bool
	{
		self.clients.can_locate_by_nickname(nickname)
	}

	/// Peut-on localiser un client de session non enregistré?
	pub fn can_locate_unregistered_client(&self, client: &client::Client) -> bool
	{
		self.clients.can_locate_unregistered_client(client.id())
	}

	/// Change le pseudonyme d'un client
	pub fn change_nickname_of_client(&self, client_socket: &mut client::Socket, nickname: &str)
	{
		use client::ClientSocketInterface;

		if let Err(err) = client_socket.client_mut().user_mut().set_nickname(nickname) {
			log::error!("Changement de pseudonyme impossible {:?}", err);

			client_socket.send_err_erroneusnickname(nickname);
			return;
		}

		self.clients.change_nickname(client_socket.cid(), nickname);

		client_socket.emit_nick();
	}

	/// Est-ce que le client (2) est dans la liste des clients bloqués du
	/// client(1) ?
	pub fn client_isin_blocklist(
		&self,
		client_socket: &client::Socket,
		other_client_socket: &client::Socket,
	) -> bool
	{
		self.clients
			.isin_blocklist(client_socket.cid(), other_client_socket.cid())
	}

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

	/// Déconnecte un client de session.
	pub fn disconnect_client(&self, client_socket: client::Socket, reason: impl ToString)
	{
		self.remove_client_from_all_his_channels(&client_socket);
		self.clients.unregister(client_socket.cid());
		client_socket.emit_quit(reason);
	}

	/// Trouve un client de session à partir de son ID.
	pub fn find_client(&self, client_id: &client::ClientID) -> Option<client::Client>
	{
		self.clients.find(client_id)
	}

	/// Cherche un [client::Socket] à partir d'un pseudonyme.
	pub fn find_socket_by_nickname(
		&self,
		socket: &socketioxide::extract::SocketRef,
		nickname: &str,
	) -> Option<client::Socket>
	{
		let to_ignore_client = self.clients.find_by_nickname(nickname)?;
		let to_ignore_socket = socket.broadcast().get_socket(to_ignore_client.sid())?;
		Some(client::Socket::Owned {
			client: Box::new(to_ignore_client),
			socket: to_ignore_socket,
		})
	}

	/// Enregistre le client en session.
	pub fn register_client(&self, client: &client::Client)
	{
		self.clients.upgrade(client);
		self.clients.register(client);
	}

	/// Supprime un client (2) de la liste des clients bloqués/ignorés du client
	/// (1).
	pub fn remove_client_to_blocklist(
		&self,
		client: &client::Socket,
		to_ignore_client: &client::Socket,
	)
	{
		self.clients
			.remove_to_block(client.cid(), to_ignore_client.cid());
	}
}

// -------------- //
// Implémentation //
// -------------- //

impl ClientsSession
{
	/// Ajoute un client dans la liste des bloqués/ignorés pour les deux
	/// clients.
	pub fn add_to_block(&self, client_id: &client::ClientID, to_ignore_client_id: &client::ClientID)
	{
		let Some(blocklist) = self.blocklist.get_mut(client_id) else {
			self.blocklist.insert(
				client_id.to_owned(),
				DashSet::from_iter([to_ignore_client_id.to_owned()]),
			);
			return;
		};
		blocklist.insert(to_ignore_client_id.to_owned());
	}

	/// La liste des clients bloqués d'un client.
	pub fn blocklist(&self, client_id: &client::ClientID) -> Vec<client::Client>
	{
		self.blocklist
			.get(client_id)
			.map(|l| l.value().iter().filter_map(|bid| self.find(&bid)).collect())
			.unwrap_or_default()
	}

	/// Peut-on localiser un client par son pseudonyme.
	pub fn can_locate_by_nickname(&self, nickname: &str) -> bool
	{
		self.clients
			.iter()
			.any(|client| client.user().nickname.to_lowercase() == nickname.to_lowercase())
	}

	/// Peut-on localiser un client non enregistré par son ID.
	pub fn can_locate_unregistered_client(&self, client_id: &client::ClientID) -> bool
	{
		self.clients
			.iter_mut()
			.any(|client| client_id.eq(client.id()) && !client.is_registered())
	}

	/// Change le pseudo d'un client par un nouveau.
	pub fn change_nickname(&self, client_id: &client::ClientID, new_nickname: &str)
	{
		let mut client = self.clients.get_mut(client_id).unwrap();
		client.user_mut().set_nickname(new_nickname).ok();
	}

	/// Crée une nouvelle session d'un client.
	pub fn create(&self, ip: net::IpAddr, socket_id: socketioxide::socket::Sid) -> client::Client
	{
		let client = client::Client::new(ip, socket_id);
		self.clients.insert(client.cid(), client.clone());
		client
	}

	/// Cherche un client en fonction de son ID.
	pub fn find(&self, client_id: &client::ClientID) -> Option<client::Client>
	{
		self.clients.iter().find_map(|rm| {
			let (cid, client) = (rm.key(), rm.value());
			(cid == client_id && client.is_registered()).then_some(client.clone())
		})
	}

	/// Trouve un client en fonction de son ID.
	pub fn find_by_nickname(&self, nickname: &str) -> Option<client::Client>
	{
		let nickname = nickname.to_lowercase();
		self.clients.iter().find_map(|rm| {
			let client = rm.value();
			(client.user().nickname.to_lowercase().eq(&nickname)).then_some(client.clone())
		})
	}

	/// Est-ce que le client (2) est dans la liste des clients bloqués du client
	/// (1).
	pub fn isin_blocklist(
		&self,
		client_id: &client::ClientID,
		other_client_id: &client::ClientID,
	) -> bool
	{
		let Some(blocklist) = self.blocklist.get(client_id) else {
			return false;
		};
		blocklist.contains(other_client_id)
	}

	/// Enregistre un client.
	pub fn register(&self, client: &client::Client)
	{
		let mut session_client = self.clients.get_mut(client.id()).unwrap();
		session_client.set_sid(client.sid());
		session_client.set_connected();
		session_client.set_registered();
	}

	/// Supprime un client (2) de la liste des clients bloqués/ignorés d'un
	/// client (1)
	pub fn remove_to_block(
		&self,
		client_id: &client::ClientID,
		to_ignore_client_id: &client::ClientID,
	)
	{
		let Some(blocklist) = self.blocklist.get_mut(client_id) else {
			return;
		};
		blocklist.remove(to_ignore_client_id);
	}

	/// Dés-enregistre un client.
	pub fn unregister(&self, client_id: &client::ClientID)
	{
		let mut client = self.clients.get_mut(client_id).unwrap();
		if client.user().nickname.is_empty() {
			drop(client);
			self.clients.remove(client_id);
		} else {
			client.disconnect();
		}
	}

	/// Mise à niveau d'un client.
	pub fn upgrade(&self, client: &client::Client)
	{
		self.clients.remove(client.id());
		self.clients.insert(client.cid(), client.clone());
	}
}
