// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::config::flex;
use crate::src::chat::components::client;
use crate::src::chat::sessions::ClientsSession;

// --------- //
// Interface //
// --------- //

pub trait OperClientSessionInterface
{
	/// Marque un client comme étant un opérateur.
	fn marks_client_as_operator(
		&self,
		client_id: &client::ClientID,
		oper: &flex::flex_config_operator_auth,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl OperClientSessionInterface for ClientsSession
{
	fn marks_client_as_operator(
		&self,
		client_id: &client::ClientID,
		oper: &flex::flex_config_operator_auth,
	)
	{
		let Some(mut client) = self.get_mut(client_id) else {
			return;
		};

		client.marks_client_as_operator(oper);
		if let Some(vhost) = oper.virtual_host.as_deref() {
			client.set_vhost(vhost);
		}
	}
}
