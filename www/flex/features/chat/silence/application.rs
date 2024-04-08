// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::client::{ClientSocketInterface, Socket};

use super::SilenceClientsSessionInterface;
use crate::features::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait SilenceApplicationInterface
{
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Ajoute un client (2) à la liste des clients bloqués/ignorés du client
	/// (1).
	fn add_client_to_blocklist(
		&self,
		client: &Self::ClientSocket<'_>,
		to_ignore_client: &Self::ClientSocket<'_>,
	) -> bool;

	/// Est-ce que le client (2) est dans la liste des clients bloqués du
	/// client(1) ?
	fn client_isin_blocklist(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		other_client_socket: &Self::ClientSocket<'_>,
	) -> bool;

	/// Supprime un client (2) de la liste des clients bloqués/ignorés du client
	/// (1).
	fn remove_client_to_blocklist(
		&self,
		client: &Self::ClientSocket<'_>,
		to_ignore_client: &Self::ClientSocket<'_>,
	) -> bool;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl SilenceApplicationInterface for ChatApplication
{
	type ClientSocket<'cs> = Socket<'cs>;

	#[rustfmt::skip]
	fn add_client_to_blocklist(
		&self,
		client: &Self::ClientSocket<'_>,
		to_ignore_client: &Self::ClientSocket<'_>,
	) -> bool
	{
		self.clients.add_to_block(client.cid(), to_ignore_client.cid())
	}

	#[rustfmt::skip]
	fn client_isin_blocklist(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		other_client_socket: &Self::ClientSocket<'_>,
	) -> bool
	{
		self.clients.isin_blocklist(client_socket.cid(), other_client_socket.cid())
	}

	#[rustfmt::skip]
	fn remove_client_to_blocklist(
		&self,
		client: &Self::ClientSocket<'_>,
		to_ignore_client: &Self::ClientSocket<'_>,
	) -> bool
	{
		self.clients.remove_to_block(client.cid(), to_ignore_client.cid())
	}
}
