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
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct KillHandler;

// -------------- //
// Implémentation //
// -------------- //

impl KillHandler
{
	pub const COMMAND_NAME: &'static str = "KILL";

	/// La commande KILL est utilisée pour fermer une connexion client-serveur
	/// par le serveur qui a la connexion actuelle. Les serveurs génèrent des
	/// messages KILL en cas de collision de pseudonymes.  Elle PEUT également
	/// être disponible pour les utilisateurs qui ont le statut d'opérateur.
	///
	/// Les clients dotés d'algorithmes de reconnexion automatique rendent cette
	/// commande inutile, car la déconnexion n'est que brève.  Elle interrompt
	/// cependant le flux de données et peut être utilisée pour stopper un grand
	/// nombre de flood provenant d'utilisateurs abusifs ou d'accidents. Les
	/// utilisateurs abusifs s'en moquent généralement, car ils se reconnectent
	/// rapidement et reprennent leur comportement abusif.  Pour éviter que
	/// cette commande ne soit utilisée de manière abusive, tout utilisateur
	/// peut choisir de recevoir des messages KILL générés pour que d'autres
	/// gardent un œil sur les points chauds.
	///
	/// Dans une arène où les pseudonymes sont OBLIGATOIREMENT uniques à tout
	/// moment, des messages KILL sont envoyés chaque fois que des "doublons"
	/// sont détectés (c'est-à-dire une tentative d'enregistrement de deux
	/// utilisateurs avec le même pseudonyme) dans l'espoir qu'ils disparaissent
	/// tous les deux et qu'un seul réapparaisse.
	///
	/// Lorsqu'un client est supprimé à la suite d'un message KILL, le serveur
	/// DEVRAIT ajouter le pseudo à la liste des pseudos indisponibles afin
	/// d'éviter que les clients ne réutilisent ce nom immédiatement, ce qui
	/// constitue généralement un comportement abusif conduisant souvent à des
	/// "boucles KILL" inutiles.
	///
	/// Le commentaire donné DOIT refléter la raison réelle du KILL.  Pour les
	/// KILLs générés par le serveur, il est généralement constitué de détails
	/// concernant les origines des deux surnoms conflictuels.  Pour les
	/// utilisateurs, c'est à eux de fournir une raison adéquate pour satisfaire
	/// les autres qui la verront.  Pour empêcher/décourager les faux KILLs
	/// d'être générés pour cacher l'identité du KILLer, le commentaire montre
	/// également un 'kill-path' qui est mis à jour par chaque serveur qu'il
	/// traverse, chacun ajoutant son nom au chemin.
	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::KillCommandFormData>,
	)
	{
		let Some(client_socket) = app.current_client_operator(&socket) else {
			return;
		};

		let Some(knick_socket) = app.find_socket_by_nickname(&socket, &data.nickname) else {
			client_socket.send_err_nosuchnick(&data.nickname);
			return;
		};

		if !app.is_operator_able_to_kill_client(&client_socket, &knick_socket) {
			return;
		}

		client_socket.emit_kill(&knick_socket, &data.comment);

		let error = format!(
			"Déconnexion: vous avez été sanctionné d'un KILL par {} ({})",
			client_socket.user().nickname,
			&data.comment
		);
		knick_socket.send_err(error);

		knick_socket.disconnect();
	}
}
