// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::client::{self, ClientSocketInterface};
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait KillApplicationInterface
{
	/// Est-ce qu'un opérateur (a) PEUT KILL un client (b)?
	fn is_operator_able_to_kill_client(
		&self,
		operator_socket: &client::Socket,
		other_socket: &client::Socket,
	) -> bool
	{
		assert!(operator_socket.user().is_operator());

		// Le client (b) n'est pas un opérateur.
		if !other_socket.user().is_operator() {
			return true;
		}

		// Les opérateurs (a) globaux PEUVENT kill tout le monde.
		if operator_socket.user().is_global_operator() {
			return true;
		}

		// Les opérateurs (a) locaux NE PEUVENT PAS kill les opérateurs.
		if operator_socket.user().is_local_operator() {
			return false;
		}

		false
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl KillApplicationInterface for ChatApplication {}
