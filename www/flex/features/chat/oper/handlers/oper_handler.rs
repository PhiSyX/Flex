// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::ClientSocketInterface;
use flex_crypto::Hasher;
use flex_web_framework::security::Argon2Password;
use socketioxide::extract::{Data, SocketRef, State};

use crate::config::chat::FlexChatConfig;
use crate::features::chat::oper::{
	OperApplicationInterface,
	OperClientSocketErrorRepliesInterface,
	OperCommandFormData,
};
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct OperHandler;

// -------------- //
// Implémentation //
// -------------- //

impl OperHandler
{
	pub const COMMAND_NAME: &'static str = "OPER";

	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<OperCommandFormData>,
	)
	{
		let mut client_socket = app.current_client_mut(&socket);

		let config = client_socket.socket().req_parts().extensions
			.get::<FlexChatConfig>()
			.cloned()
			.expect("Configuration de notre application serveur");

		let Some(operator) = config.operators
			.iter()
			.find(|operator| operator.identifier.eq(&data.name))
			.cloned()
		else {
			client_socket.send_err_nooperhost();
			return;
		};

		let password_hasher = socket.req_parts().extensions
			.get::<Argon2Password>()
			.expect("Le service d'encodage Argon2.");

		if !password_hasher.cmp(
			operator.password.expose(),
			data.password.expose(),
		) {
			client_socket.send_err_passwdmismatch();
			return;
		}

		app.marks_client_as_operator(&mut client_socket, &operator);

		for channel_name in config.operator.auto_join.iter() {
			app.join_or_create_oper_channel(&client_socket, channel_name);
		}
	}
}
