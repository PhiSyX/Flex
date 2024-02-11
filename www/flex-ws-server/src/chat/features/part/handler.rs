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

use super::{PartChannelApplicationInterface, PartCommandFormData, SapartCommandFormData};
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct PartHandler;

pub struct SapartHandler;

// -------------- //
// Implémentation //
// -------------- //

impl PartHandler
{
	pub const COMMAND_NAME: &'static str = "PART";

	/// La commande PART entraîne la suppression de l'utilisateur qui envoie le
	/// message de la liste des membres actifs pour tous les salons énumérés
	/// dans la chaîne de paramètres. Si un message est donné, il sera envoyé à
	/// la place du message par défaut, le pseudo. Cette demande est toujours
	/// acceptée par le serveur.
	///
	/// Les serveurs DOIVENT être capables d'analyser les arguments sous la
	/// forme d'une liste de cibles, mais NE DOIVENT PAS utiliser de listes lors
	/// de l'envoi de messages PART aux clients.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<PartCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel_name in data.channels.iter() {
			app.part_channel::<&str>(&client_socket, channel_name, data.message.as_deref());
		}
	}
}

impl SapartHandler
{
	pub const COMMAND_NAME: &'static str = "SAPART";

	/// La commande SAPART entraîne la suppression des utilisateurs de force.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<SapartCommandFormData>,
	)
	{
		let Some(client_socket) = app.current_client_operator(&socket) else {
			return;
		};

		for nickname in data.nicknames.iter() {
			let Some(nickname_socket) = app.find_socket_by_nickname(&socket, nickname) else {
				client_socket.send_err_nosuchnick(nickname);
				continue;
			};

			for channel_name in data.channels.iter() {
				app.force_part_channel::<&str>(
					&client_socket,
					&nickname_socket,
					channel_name,
					data.message.as_deref(),
				);
			}
		}
	}
}
