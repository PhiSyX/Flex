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

use crate::config::chat::FlexChatConfigOperatorAuth;
use crate::features::chat::sessions::ClientsSession;

// --------- //
// Interface //
// --------- //

pub trait OperClientSessionInterface: ClientsSessionInterface
{
	/// Marque un client comme étant un opérateur.
	fn marks_client_as_operator(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
		oper: &FlexChatConfigOperatorAuth,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl OperClientSessionInterface for ClientsSession
{
	fn marks_client_as_operator(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
		oper: &FlexChatConfigOperatorAuth,
	)
	{
		let Some(mut client) = self.get_mut(client_id) else { return; };

		client.marks_client_as_operator(oper.oper_type, &oper.flags);
		if let Some(vhost) = oper.virtual_host.as_deref() {
			client.set_vhost(vhost);
		}
	}
}
