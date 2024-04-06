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
use flex_chat_user::UserAwayInterface;

use crate::features::chat::sessions::ClientsSession;

// --------- //
// Interface //
// --------- //

pub trait UserStatusAwayClientsSessionInterface
	: ClientsSessionInterface
{
	/// Vérifie si un client en session est absent.
	fn is_client_away(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
	) -> bool;

	/// Marque un client comme étant absent.
	fn marks_client_as_away(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
		text: impl ToString,
	);

	/// Marque un client comme n'étant plus absent.
	fn marks_client_as_no_longer_away(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl UserStatusAwayClientsSessionInterface for ClientsSession
{
	/// Vérifie si un client en session est absent.
	fn is_client_away(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
	) -> bool
	{
		let Some(client) = self.get(client_id) else {
			return false;
		};
		client.user().is_away()
	}

	/// Marque un client comme étant absent.
	fn marks_client_as_away(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
		text: impl ToString,
	)
	{
		let Some(mut client) = self.get_mut(client_id) else {
			return;
		};
		client.marks_user_as_away(text);
	}

	/// Marque un client comme n'étant plus absent.
	fn marks_client_as_no_longer_away(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
	)
	{
		let Some(mut client) = self.get_mut(client_id) else { return };
		client.marks_user_as_no_longer_away();
	}
}
