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

use crate::features::chat::kick::{KickCommandFormData, KickApplicationInterface};
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct KickHandler;

// -------------- //
// Implémentation //
// -------------- //

impl KickHandler
{
	pub const COMMAND_NAME: &'static str = "KICK";

	/// La commande KICK peut être utilisée pour demander le retrait forcé d'un
	/// utilisateur d'un salon. Elle entraîne le retrait forcé de l'<user> du
	/// <channel>. Pour que le message soit syntaxiquement correct, il DOIT y
	/// avoir soit un paramètre de salon et plusieurs paramètres d'utilisateur,
	/// soit autant de paramètres de salon qu'il y a de paramètres
	/// d'utilisateur.
	///
	/// Si un "<comment>" est donné, il sera envoyé à la place du message par
	/// défaut, le surnom de l'utilisateur qui émet le KICK.
	///
	/// Le serveur NE DOIT PAS envoyer aux clients des messages KICK comportant
	/// plusieurs salons ou utilisateurs. Ceci est nécessaire pour maintenir la
	/// compatibilité avec les anciens logiciels clients.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<KickCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel_name in data.channels.iter() {
			app.kick_clients_on_channel(
				&client_socket,
				channel_name,
				&data.knicks,
				data.comment.as_deref(),
			);
		}
	}
}
