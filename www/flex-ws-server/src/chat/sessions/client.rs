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

use crate::config::flex;
use crate::src::chat::components::client::ClientSocketInterface;
use crate::src::chat::components::{self, channel, client, nick};
use crate::src::chat::features::ApplyMode;
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
		if let Err(err) = client_socket.user_mut().set_nickname(nickname) {
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

	/// Déconnecte un client de session.
	pub fn disconnect_client(&self, client_socket: client::Socket, reason: impl ToString)
	{
		let Some(mut session_client) = self.get_client_mut_by_id(client_socket.cid()) else {
			return;
		};
		for channel_name in session_client.channels.iter() {
			client_socket.emit_quit(channel_name, reason.to_string());
		}
		self.channels
			.remove_client_from_all_his_channels(&session_client);
		session_client.channels.clear();
		session_client.disconnect();
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

	/// Est-ce que le client est un opérateur global?
	pub fn is_client_global_operator(&self, client_socket: &client::Socket) -> bool
	{
		let Some(client) = self.get_client_by_id(client_socket.cid()) else {
			return false;
		};
		client.user().is_global_operator()
	}

	/// Est-ce qu'un opérateur (a) PEUT KILL un client (b)?
	pub fn is_operator_able_to_kill_client(
		&self,
		operator_socket: &client::Socket,
		other_socket: &client::Socket,
	) -> bool
	{
		assert!(operator_socket.user().is_operator());

		// Le client (b) n'est pas un opérateur.
		if !other_socket.user().is_operator() {
			return true;
		}

		// Les opérateurs (a) globaux PEUVENT kill tout le monde.
		if operator_socket.user().is_global_operator() {
			return true;
		}

		// Les opérateurs (a) locaux NE PEUVENT PAS kill les opérateurs.
		if operator_socket.user().is_local_operator() {
			return false;
		}

		false
	}

	/// Marque le client en session comme étant absent.
	pub fn marks_client_as_away(&self, client_socket: &client::Socket, text: impl ToString)
	{
		self.clients.marks_client_as_away(client_socket.cid(), text);
		client_socket.send_rpl_nowaway();
	}

	/// Marque le client en session comme n'étant plus absent.
	pub fn marks_client_as_no_longer_away(&self, client_socket: &client::Socket)
	{
		if self.clients.is_client_away(client_socket.cid()) {
			self.clients
				.marks_client_as_no_longer_away(client_socket.cid());
			client_socket.send_rpl_unaway();
		} else {
			self.clients
				.marks_client_as_away(client_socket.cid(), "Je suis absent.");
			client_socket.send_rpl_nowaway();
		}
	}

	/// Marque le client en session comme étant un opérateur.
	pub fn marks_client_as_operator(
		&self,
		client_socket: &mut client::Socket,
		oper: &flex::flex_config_operator_auth,
	)
	{
		self.clients
			.marks_client_as_operator(client_socket.cid(), oper);

		if let Some(vhost) = oper.virtual_host.as_deref() {
			client_socket.user_mut().set_vhost(vhost);
		}

		client_socket.client_mut().marks_client_as_operator(oper);

		let flag_oper = match oper.oper_type {
			| flex::flex_config_operator_type::LocalOperator => {
				components::user::Flag::LocalOperator
			}
			| flex::flex_config_operator_type::GlobalOperator => {
				components::user::Flag::GlobalOperator
			}
		};

		client_socket.emit_umode(&[ApplyMode::new(flag_oper.clone())]);

		client_socket.send_rpl_youreoper(flag_oper);
	}

	/// Enregistre le client en session.
	pub fn register_client(&self, client: &client::Client)
	{
		self.clients.upgrade(client);
		self.clients.register(client);
	}

	/// Supprime un niveau d'accès pour un pseudo d'un salon.
	pub fn remove_client_access_level_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		unset_access_level: nick::ChannelAccessLevel,
	) -> Option<nick::ChannelNick>
	{
		self.channels.remove_client_access_level(
			channel_name,
			client_socket.cid(),
			unset_access_level,
		)
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
			.map(|l| l.value().iter().filter_map(|bid| self.get(&bid)).collect())
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

	/// Trouve un client en fonction de son ID.
	pub fn get_by_nickname(&self, nickname: &str) -> Option<client::Client>
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

	/// Vérifie si un client en session est absent.
	pub fn is_client_away(&self, client_id: &client::ClientID) -> bool
	{
		let Some(client) = self.get(client_id) else {
			return false;
		};

		client.user().is_away()
	}

	/// Marque un client comme étant absent.
	pub fn marks_client_as_away(&self, client_id: &client::ClientID, text: impl ToString)
	{
		let Some(mut client) = self.get_mut(client_id) else {
			return;
		};

		client.marks_user_as_away(text.to_string());
	}

	/// Marque un client comme n'étant plus absent.
	pub fn marks_client_as_no_longer_away(&self, client_id: &client::ClientID)
	{
		let Some(mut client) = self.get_mut(client_id) else {
			return;
		};

		client.marks_user_as_no_longer_away();
	}

	/// Marque un client comme étant un opérateur.
	pub fn marks_client_as_operator(
		&self,
		client_id: &client::ClientID,
		oper: &flex::flex_config_operator_auth,
	)
	{
		let Some(mut client) = self.get_mut(client_id) else {
			return;
		};

		client.marks_client_as_operator(oper);
		if let Some(vhost) = oper.virtual_host.as_deref() {
			client.set_vhost(vhost);
		}
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

	/// Mise à niveau d'un client.
	pub fn upgrade(&self, client: &client::Client)
	{
		self.clients.remove(client.id());
		self.clients.insert(client.cid(), client.clone());
	}
}
