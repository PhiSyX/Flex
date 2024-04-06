// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientInterface, ClientsSessionInterface};

use crate::features::chat::sessions::ClientsSession;

// --------- //
// Interface //
// --------- //

pub trait AuthClientSessionInterface: ClientsSessionInterface
{
	/// Change l'ID d'un client par un nouveau.
	fn change_client_id(
		&self,
		old_client_id: &<Self::Client as ClientInterface>::ClientID,
		new_client_id: <Self::Client as ClientInterface>::ClientID,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl AuthClientSessionInterface for ClientsSession
{
	fn change_client_id(
		&self,
		old_client_id: &<Self::Client as ClientInterface>::ClientID,
		new_client_id: <Self::Client as ClientInterface>::ClientID,
	)
	{
		let (_, mut client) = self.clients.remove(old_client_id).unwrap();
		client.set_cid(new_client_id);
		client.new_token();
		self.clients.insert(new_client_id, client);
	}
}
