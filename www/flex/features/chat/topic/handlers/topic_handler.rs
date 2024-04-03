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

use crate::features::chat::topic::{
	TopicCommandFormData,
	TopicApplicationInterface,
	TopicClientSocketInterface,
};
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct TopicHandler;

// -------------- //
// Implémentation //
// -------------- //

impl TopicHandler
{
	pub const COMMAND_NAME: &'static str = "TOPIC";

	/// La commande TOPIC permet de modifier ou d'afficher le sujet d'un salon.
	/// Le sujet du salon <channel> est renvoyé s'il n'y a pas de <topic>. Si le
	/// paramètre <topic> est présent, le sujet de ce salon sera modifié, si
	/// cette action est autorisée pour l'utilisateur qui la demande. Si le
	/// paramètre <topic> est une chaîne vide, le sujet de ce salon sera
	/// supprimé.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<TopicCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		if !app.is_client_can_edit_topic(&client_socket, &data.channel) {
			return;
		}

		if let Some(topic) = data.topic.as_deref() {
			app.update_topic(&client_socket, &data.channel, topic);
		} else {
			let Some(channel) = app.get_channel(&data.channel) else { return; };
			client_socket.send_rpl_topic(&channel, false);
		}
	}
}
