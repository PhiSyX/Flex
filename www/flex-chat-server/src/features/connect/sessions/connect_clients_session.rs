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

use flex_chat_client::{Client, ClientInterface, ClientsSessionInterface};

use crate::src::sessions::ClientsSession;

// --------- //
// Interface //
// --------- //

pub trait ConnectClientsSessionInterface: ClientsSessionInterface
{
	/// Crée une nouvelle session d'un client.
	fn create(
		&self,
		ip: net::IpAddr,
		socket_id: <Self::Client as ClientInterface>::SocketID,
	) -> Self::Client;

	/// Peut-on localiser un client non enregistré par son ID.
	fn can_locate_unregistered_client(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
	) -> bool;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ConnectClientsSessionInterface for ClientsSession
{
	fn create(
		&self,
		ip: net::IpAddr,
		socket_id: <Self::Client as ClientInterface>::SocketID,
	) -> Self::Client
	{
		let client = Client::new(ip, socket_id);
		self.clients.insert(*client.cid(), client.clone());
		client
	}

	fn can_locate_unregistered_client(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
	) -> bool
	{
		self.clients
			.iter_mut()
			.any(|client| client_id.eq(client.cid()) && !client.is_registered())
	}
}
