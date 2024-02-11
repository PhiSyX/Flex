// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Interface //
// --------- //

use dashmap::DashSet;

use crate::src::chat::components::client;
use crate::src::chat::sessions::ClientsSession;

pub trait SilenceClientsSessionInterface
{
	/// Ajoute un client dans la liste des bloqués/ignorés pour les deux
	/// clients.
	fn add_to_block(
		&self,
		client_id: &client::ClientID,
		to_ignore_client_id: &client::ClientID,
	) -> bool;

	/// La liste des clients bloqués d'un client.
	fn blocklist(&self, client_id: &client::ClientID) -> Vec<client::Client>;

	/// Est-ce que le client (2) est dans la liste des clients bloqués du client
	/// (1).
	fn isin_blocklist(
		&self,
		client_id: &client::ClientID,
		other_client_id: &client::ClientID,
	) -> bool;

	/// Supprime un client (2) de la liste des clients bloqués/ignorés d'un
	/// client (1)
	fn remove_to_block(
		&self,
		client_id: &client::ClientID,
		to_ignore_client_id: &client::ClientID,
	) -> bool;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl SilenceClientsSessionInterface for ClientsSession
{
	fn add_to_block(
		&self,
		client_id: &client::ClientID,
		to_ignore_client_id: &client::ClientID,
	) -> bool
	{
		let Some(blocklist) = self.blocklist.get_mut(client_id) else {
			self.blocklist.insert(
				client_id.to_owned(),
				DashSet::from_iter([to_ignore_client_id.to_owned()]),
			);
			return true;
		};
		blocklist.insert(to_ignore_client_id.to_owned())
	}

	fn blocklist(&self, client_id: &client::ClientID) -> Vec<client::Client>
	{
		self.blocklist
			.get(client_id)
			.map(|l| l.value().iter().filter_map(|bid| self.get(&bid)).collect())
			.unwrap_or_default()
	}

	fn isin_blocklist(
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

	fn remove_to_block(
		&self,
		client_id: &client::ClientID,
		to_ignore_client_id: &client::ClientID,
	) -> bool
	{
		let Some(blocklist) = self.blocklist.get_mut(client_id) else {
			return false;
		};
		blocklist.remove(to_ignore_client_id).is_some()
	}
}
