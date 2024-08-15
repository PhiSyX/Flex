// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::client::Client;
use socketioxide::extract::{Data, SocketRef, State};
use socketioxide::socket;

use crate::features::chat::quit::{
	QuitApplicationInterface,
	QuitCommandFormData,
};
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct QuitHandler;

// -------------- //
// Implémentation //
// -------------- //

impl QuitHandler
{
	pub const COMMAND_NAME: &'static str = "QUIT";

	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<QuitCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);
		app.disconnect_client(
			client_socket, 
			data.message.as_deref().unwrap_or("Client Quit"),
		);
		socket.extensions.remove::<Client>();
		drop(socket);
	}
}

impl QuitHandler
{
	/// Gestion de l'événement de déconnexion.
	pub async fn handle_disconnect(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		reason: socket::DisconnectReason,
	)
	{
		let client_socket = app.current_client(&socket);
		app.disconnect_client(client_socket, reason);
		socket.extensions.remove::<Client>();
		drop(socket);
	}
}
