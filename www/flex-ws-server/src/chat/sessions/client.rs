// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use dashmap::mapref::multiple::RefMutMulti;
use dashmap::{DashMap, DashSet};
use flex_chat_client::{
	Client,
	ClientID,
	ClientInterface,
	ClientServerApplicationInterface,
	ClientSocketInterface,
	ClientsSessionInterface,
	Socket,
};
use flex_chat_user::{UserInterface, UserOperatorInterface};

use crate::src::chat::features::OperClientSocketErrorRepliesInterface;
use crate::src::ChatApplication;

// ---- //
// Type //
// ---- //

pub type BlockedByID = ClientID;
pub type BlockedID = ClientID;

// --------- //
// Structure //
// --------- //

#[derive(Default)]
pub struct ClientsSession
{
	/// Les utilisateurs bloqués pour chaque utilisateur.
	pub blocklist: DashMap<BlockedByID, DashSet<BlockedID>>,
	/// Les clients de session.
	pub clients: DashMap<ClientID, Client>,
}

// -------------- //
// Implémentation // -> ChatApplication
// -------------- //

impl ChatApplication
{
	/// Récupère le client courant (immuable) à partir d'une socket.
	pub fn current_client<'a>(&'a self, socket: &'a socketioxide::extract::SocketRef)
		-> Socket<'a>
	{
		let client: socketioxide::extensions::Ref<'a, Client> = socket.extensions.get().unwrap();
		Socket::Borrowed { socket, client }
	}

	/// Récupère le client courant (immuable) avec les droits d'opérateurs
	/// globaux / locaux à partir d'une socket.
	pub fn current_client_operator<'a>(
		&'a self,
		socket: &'a socketioxide::extract::SocketRef,
	) -> Option<Socket<'a>>
	{
		let client: socketioxide::extensions::Ref<'a, Client> = socket.extensions.get().unwrap();
		let client_socket = Socket::Borrowed { socket, client };

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
	) -> Socket<'a>
	{
		let client: socketioxide::extensions::RefMut<'a, Client> =
			socket.extensions.get_mut().unwrap();
		Socket::BorrowedMut { socket, client }
	}

	/// Cherche un [Socket] à partir d'un pseudonyme.
	pub fn find_socket_by_nickname(
		&self,
		socket: &socketioxide::extract::SocketRef,
		nickname: &str,
	) -> Option<Socket>
	{
		let client = self.clients.get_by_nickname(nickname)?;
		let socket = socket.broadcast().get_socket(*client.maybe_sid()?)?;
		Some(Socket::Owned {
			client: Box::new(client),
			socket,
		})
	}

	/// Récupère un client à partir de son ID.
	pub fn get_client_mut_by_id(
		&self,
		client_id: &ClientID,
	) -> Option<RefMutMulti<'_, ClientID, Client>>
	{
		self.clients.get_mut(client_id)
	}
}

// -------------- //
// Implémentation //
// -------------- //

impl ClientsSession
{
	/// Trouve un client en fonction de son pseudo.
	pub fn get_by_nickname(&self, nickname: &str) -> Option<Client>
	{
		let nickname = nickname.to_lowercase();
		self.clients.iter().find_map(|rm| {
			let client = rm.value();
			(client.user().nickname().to_lowercase().eq(&nickname)).then_some(client.clone())
		})
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ClientServerApplicationInterface for ChatApplication
{
	type ClientSocket<'cs> = Socket<'cs>;

	fn get_client_by_id(
		&self,
		client_id: &<<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID,
	) -> Option<<Self::ClientSocket<'_> as ClientSocketInterface>::Client>
	{
		self.clients.get(client_id)
	}
}

impl ClientsSessionInterface for ClientsSession
{
	type Client = Client;

	fn get(&self, client_id: &<Self::Client as ClientInterface>::ClientID) -> Option<Self::Client>
	{
		self.clients.iter().find_map(|rm| {
			let (cid, client) = (rm.key(), rm.value());
			(cid == client_id && client.is_registered()).then_some(client.clone())
		})
	}

	fn get_mut(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
	) -> Option<RefMutMulti<'_, <Self::Client as ClientInterface>::ClientID, Self::Client>>
	{
		self.clients
			.iter_mut()
			.find(|rm| rm.key() == client_id && rm.value().is_registered())
	}

	/// Enregistre un client.
	fn register(&self, client: &Client)
	{
		let mut session_client = self.clients.get_mut(client.cid()).unwrap();
		if let Some(sid) = client.maybe_sid() {
			session_client.set_sid(*sid);
		}
		session_client.set_connected();
		session_client.set_registered();
	}

	/// Mise à niveau d'un client.
	fn upgrade(&self, client: &Client)
	{
		self.clients.remove(client.cid());
		self.clients.insert(*client.cid(), client.clone());
	}
}
