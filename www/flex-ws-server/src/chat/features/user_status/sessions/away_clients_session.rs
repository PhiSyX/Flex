// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientID, ClientInterface, ClientsSessionInterface};
use flex_chat_user::UserAwayInterface;

use crate::src::chat::sessions::ClientsSession;

// --------- //
// Interface //
// --------- //

pub trait UserStatusAwayClientsSessionInterface
{
	/// Vérifie si un client en session est absent.
	fn is_client_away(&self, client_id: &ClientID) -> bool;

	/// Marque un client comme étant absent.
	fn marks_client_as_away(&self, client_id: &ClientID, text: impl ToString);

	/// Marque un client comme n'étant plus absent.
	fn marks_client_as_no_longer_away(&self, client_id: &ClientID);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl UserStatusAwayClientsSessionInterface for ClientsSession
{
	/// Vérifie si un client en session est absent.
	fn is_client_away(&self, client_id: &ClientID) -> bool
	{
		let Some(client) = self.get(client_id) else {
			return false;
		};

		client.user().is_away()
	}

	/// Marque un client comme étant absent.
	fn marks_client_as_away(&self, client_id: &ClientID, text: impl ToString)
	{
		let Some(mut client) = self.get_mut(client_id) else {
			return;
		};

		client.marks_user_as_away(text);
	}

	/// Marque un client comme n'étant plus absent.
	fn marks_client_as_no_longer_away(&self, client_id: &ClientID)
	{
		let Some(mut client) = self.get_mut(client_id) else {
			return;
		};

		client.marks_user_as_no_longer_away();
	}
}
