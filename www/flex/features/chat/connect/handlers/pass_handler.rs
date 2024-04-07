// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientInterface, ClientSocketInterface};
use flex_chat_user::UserInterface;
use socketioxide::extract::{Data, SocketRef, State};

use crate::config::chat::FlexChatConfig;
use crate::features::chat::connect::forms::PassCommandFormData;
use crate::features::chat::connect::responses::ConnectClientSocketErrorRepliesInterface;
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct PassHandler;

// -------------- //
// Implémentation //
// -------------- //

impl PassHandler
{
	/// Nom de la commande envoyée par la socket.
	pub const COMMAND_NAME: &'static str = "PASS";

	/// La commande `PASS` est utilisée pour définir un "mot de passe de
	/// connexion". Le mot de passe optionnel PEUT et DOIT être défini avant
	/// toute tentative d'enregistrement de la connexion. Actuellement, cela
	/// nécessite que le client envoie une commande `PASS` avant d'envoyer la
	/// combinaison `NICK`/`USER`.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<PassCommandFormData>,
	)
	{
		let mut client_socket = app.current_client_mut(&socket);

		// NOTE(phisyx): l'enregistrement se fait en plusieurs étapes. Après
		//               s'être enregistré, le client NE PEUT PLUS envoyer
		//               cette commande.
		if client_socket.client().is_registered() {
			client_socket.send_err_alreadyregistered();
			return;
		}

		#[rustfmt::skip]
		let config = {
			socket.req_parts().extensions.get::<FlexChatConfig>()
		}.unwrap();

		// NOTE(phisyx): ignore la demande si le serveur n'a pas de mot de passe
		//               dans sa configuration.
		if config.server.password.is_none() {
			return;
		}

		client_socket.user_mut().set_password(data.password);
	}
}
