// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{Channel, ChannelInterface};
use flex_chat_client::{ClientInterface, ClientSocketInterface, ClientsSessionInterface, Socket};
use flex_web_framework::extract::InsecureClientIp;

use super::ConnectClientsSessionInterface;
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait ConnectApplicationInterface
{
	type Channel: ChannelInterface;
	type ClientSocket<'cs>: ClientSocketInterface
	where
		Self: 'cs;

	/// Crée une nouvelle session d'un client à partir d'une socket.
	fn create_client(
		&self,
		socket: &<Self::ClientSocket<'_> as ClientSocketInterface>::Socket,
	) -> <Self::ClientSocket<'_> as ClientSocketInterface>::Client;

	/// Peut-on localiser un client de session non enregistré?
	fn can_locate_unregistered_client(
		&self,
		client: &<Self::ClientSocket<'_> as ClientSocketInterface>::Client,
	) -> bool;

	/// Récupère un client à partir de son ID et son jeton.
	fn get_client_by_id_and_token(
		&self,
		client_id: &<<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID,
		token: impl AsRef<str>,
	) -> Option<<Self::ClientSocket<'_> as ClientSocketInterface>::Client>;

	/// Enregistre le client en session.
	fn register_client(&self, client: &<Self::ClientSocket<'_> as ClientSocketInterface>::Client);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ConnectApplicationInterface for ChatApplication
{
	type Channel = Channel;
	type ClientSocket<'cs> = Socket<'cs>;

	fn create_client(
		&self,
		socket: &<Self::ClientSocket<'_> as ClientSocketInterface>::Socket,
	) -> <Self::ClientSocket<'_> as ClientSocketInterface>::Client
	{
		// TODO: SecureClientIp ?
		let InsecureClientIp(ip) =
			InsecureClientIp::from(&socket.req_parts().headers, &socket.req_parts().extensions)
				.expect("Adresse IP de la Socket");
		let sid = socket.id;
		self.clients.create(ip, sid)
	}

	fn can_locate_unregistered_client(
		&self,
		client: &<Self::ClientSocket<'_> as ClientSocketInterface>::Client,
	) -> bool
	{
		self.clients.can_locate_unregistered_client(client.cid())
	}

	fn get_client_by_id_and_token(
		&self,
		client_id: &<<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID,
		token: impl AsRef<str>,
	) -> Option<<Self::ClientSocket<'_> as ClientSocketInterface>::Client>
	{
		self.clients
			.get(client_id)
			.filter(|client| client.token().eq(token.as_ref()))
	}

	fn register_client(&self, client: &<Self::ClientSocket<'_> as ClientSocketInterface>::Client)
	{
		self.clients.upgrade(client);
		self.clients.register(client);
	}
}
