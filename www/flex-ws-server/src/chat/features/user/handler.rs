// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use socketioxide::extract::{Data, SocketRef, State};

use crate::src::chat::components::ClientSocketInterface;
use crate::src::chat::features::ConnectionRegistrationHandler;
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct UserHandler;

// -------------- //
// Implémentation //
// -------------- //

impl UserHandler
{
	/// Nom de la commande envoyée par la socket.
	pub const COMMAND_NAME: &'static str = "USER";

	/// La commande `USER` est utilisée au début de la connexion pour spécifier
	/// le nom d'utilisateur, le nom d'hôte et le nom réel d'un nouvel
	/// utilisateur.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::UserCommandFormData>,
	)
	{
		let check = {
			let mut client_socket = app.current_client_mut(&socket);

			if client_socket.client().is_registered() {
				client_socket.send_err_alreadyregistered();
				return;
			}

			if let Err(error) = client_socket.user_mut().set_ident(data.user) {
				tracing::error!(?error, "Impossible d'assigner l'ident",);
				None
			} else {
				client_socket.user_mut().set_realname(data.realname);

				ConnectionRegistrationHandler::complete_registration(app, client_socket)
			}
		};

		if check.is_none() {
			_ = socket.disconnect();
		}
	}
}
