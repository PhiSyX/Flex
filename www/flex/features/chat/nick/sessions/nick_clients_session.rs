// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::client::{ClientInterface, ClientsSessionInterface};
use flex_chat::user::UserInterface;

use crate::features::chat::sessions::ClientsSession;

// --------- //
// Interface //
// --------- //

#[rustfmt::skip]
pub trait NickClientSessionInterface
	: ClientsSessionInterface
{
	/// Peut-on localiser un client par son pseudonyme.
	fn can_locate_by_nickname(&self, nickname: impl AsRef<str>) -> bool;

	/// Change le pseudo d'un client par un nouveau.
	fn change_nickname(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
		new_nickname: impl ToString,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl NickClientSessionInterface for ClientsSession
{
	fn can_locate_by_nickname(&self, nickname: impl AsRef<str>) -> bool
	{
		self.clients.iter().any(|client| {
			client.user().nickname().to_lowercase()
				== nickname.as_ref().to_lowercase()
		})
	}

	fn change_nickname(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
		new_nickname: impl ToString,
	)
	{
		let mut client = self.clients.get_mut(client_id).unwrap();
		client.user_mut().set_nickname(new_nickname).ok();
	}
}
