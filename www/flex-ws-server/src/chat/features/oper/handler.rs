// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_crypto::{Argon2Encryption, Encryption};
use flex_web_framework::security::SecurityEncryptionService;
use socketioxide::extract::{Data, SocketRef, State};

use super::ErrNooperhostError;
use crate::config::flex::flex_config;
use crate::src::chat::components::ClientSocketInterface;
use crate::src::ChatApplication;

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

	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::OperCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		let config = client_socket
			.socket()
			.req_parts()
			.extensions
			.get::<flex_config>()
			.expect("Configuration de notre application serveur");

		let Some(operator) = config
			.operators
			.iter()
			.find(|operator| operator.identifier.eq(&data.name))
		else {
			client_socket.send_err_nooperhost();
			return;
		};

		let security_encryption = socket
			.req_parts()
			.extensions
			.get::<SecurityEncryptionService<Argon2Encryption>>()
			.expect("Le service de chiffrement Argon2.");

		if !security_encryption.cmp(operator.password.expose(), data.password.expose()) {
			client_socket.send_err_passwdmismatch();
			return;
		}

		app.marks_client_as_operator(&client_socket, operator.oper_type);
	}
}
