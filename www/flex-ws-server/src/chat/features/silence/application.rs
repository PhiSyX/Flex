// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientSocketInterface, Socket};

use super::SilenceClientsSessionInterface;
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait SilenceApplicationInterface
{
	/// Ajoute un client (2) à la liste des clients bloqués/ignorés du client
	/// (1).
	fn add_client_to_blocklist(&self, client: &Socket, to_ignore_client: &Socket) -> bool;

	/// Est-ce que le client (2) est dans la liste des clients bloqués du
	/// client(1) ?
	fn client_isin_blocklist(&self, client_socket: &Socket, other_client_socket: &Socket) -> bool;

	/// Supprime un client (2) de la liste des clients bloqués/ignorés du client
	/// (1).
	fn remove_client_to_blocklist(&self, client: &Socket, to_ignore_client: &Socket) -> bool;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl SilenceApplicationInterface for ChatApplication
{
	fn add_client_to_blocklist(&self, client: &Socket, to_ignore_client: &Socket) -> bool
	{
		self.clients
			.add_to_block(client.cid(), to_ignore_client.cid())
	}

	fn client_isin_blocklist(&self, client_socket: &Socket, other_client_socket: &Socket) -> bool
	{
		self.clients
			.isin_blocklist(client_socket.cid(), other_client_socket.cid())
	}

	fn remove_client_to_blocklist(&self, client: &Socket, to_ignore_client: &Socket) -> bool
	{
		self.clients
			.remove_to_block(client.cid(), to_ignore_client.cid())
	}
}
