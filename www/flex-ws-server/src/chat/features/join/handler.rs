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

use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct JoinHandler;

// -------------- //
// Implémentation //
// -------------- //

impl JoinHandler
{
	pub const COMMAND_NAME: &'static str = "JOIN";

	/// La commande JOIN est utilisée par un client pour demander de commencer à
	/// écouter un salon spécifique. Les serveurs DOIVENT être en mesure
	/// d'analyser les arguments sous la forme d'une liste de cibles, mais NE
	/// DOIVENT PAS utiliser de listes lorsqu'ils envoient des messages JOIN aux
	/// clients.
	///
	/// Une fois qu'un client a rejoint un salon, il reçoit des informations sur
	/// toutes les commandes que son serveur reçoit et qui affectent le salon.
	/// Cela inclut les commandes JOIN, MODE, KICK, PART, QUIT et bien sûr
	/// PRIVMSG/NOTICE. Cela permet aux membres du salon de suivre l'évolution
	/// des autres membres du salon, ainsi que d'obtenir des informations sur
	/// les autres membres du salon.
	///
	/// Si un JOIN est réussi, le client reçoit un message JOIN comme
	/// confirmation et reçoit ensuite le sujet du salon (en utilisant
	/// RPL_TOPIC) et la liste des membres qui sont sur le salon (en utilisant
	/// RPL_NAMREPLY), qui DOIT inclure le client qui s'est joint.
	///
	/// NOTE: ce message accepte un argument spécial ("0"), qui est une demande
	/// spéciale de quitter tous les salons dont le client est actuellement
	/// membre. Le serveur traitera ce message comme si le client avait envoyé
	/// une commande PART pour chaque salon dont il est membre.
	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::JoinCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		// NOTE: Cas spécial "/JOIN 0" : partir de tous les salons.
		if data.channels.first().filter(|s| s.eq(&"0")).is_some() {
			app.remove_client_from_all_his_channels(&client_socket);
			return;
		}

		// NOTE: étapes à suivre pour rejoindre le salon.
		//
		// 1. Si le salon existe déjà, ignorer la demande JOIN du client. Cependant, si
		//    le client n'existe pas dans le salon, l'ajouter à ce dernier.
		//
		// 2. Créer le salon.

		let channel_keys = &data.keys;
		for (idx, channel_name) in data.channels.iter().enumerate() {
			let channel_key = channel_keys.get(idx).filter(|key| !key.is_empty());
			app.join_or_create_channel(&client_socket, channel_name, channel_key);
		}
	}
}