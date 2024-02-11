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

use super::{AwayCommandFormData, UserStatusAwayApplicationInterface};
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct AwayHandler;

// -------------- //
// Implémentation //
// -------------- //

impl AwayHandler
{
	pub const COMMAND_NAME: &'static str = "AWAY";

	/// Avec la commande AWAY, les clients peuvent définir une chaîne de réponse
	/// automatique pour toutes les commandes PRIVMSG qui leur sont adressées
	/// (et non à un salon sur lequel ils se trouvent). Le serveur envoie une
	/// réponse automatique au client qui envoie la commande PRIVMSG. Seul le
	/// serveur répondant est celui auquel le client émetteur est connecté.
	///
	/// La commande AWAY est utilisée soit avec un paramètre, pour définir un
	/// message AWAY, soit sans paramètre, pour supprimer le message AWAY.
	///
	/// En raison de son coût élevé (en termes de mémoire et de bande passante),
	/// le message AWAY ne devrait être utilisé que pour les communications
	/// client-serveur.  Un serveur PEUT choisir d'ignorer silencieusement les
	/// messages AWAY reçus d'autres serveurs. Pour mettre à jour l'état
	/// d'absence d'un client à travers les serveurs, le mode utilisateur "a"
	/// devrait être utilisé à la place.
	///
	/// TODO: Notifier les clients avec les capacités serveur (away-notify).
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<AwayCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		match data.text {
			| Some(text) => app.marks_client_as_away(&client_socket, text),
			| None => app.marks_client_as_no_longer_away(&client_socket),
		}
	}
}
