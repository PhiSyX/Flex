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

use super::{NoticeClientSocketCommandResponseInterface, NoticeCommandFormData};
use crate::src::chat::components::client::ClientSocketInterface;
use crate::src::chat::components::Origin;
use crate::src::chat::features::{SilenceApplicationInterface, UserStatusClientSocketInterface};
use crate::src::chat::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct NoticeHandler;

// -------------- //
// Implémentation //
// -------------- //

impl NoticeHandler
{
	pub const COMMAND_NAME: &'static str = "NOTICE";

	/// La commande NOTICE s'utilise de la même manière que la commande
	/// PRIVMSG/PUBMSG. La différence entre NOTICE et PRIVMSG/PUBMSG est que les
	/// réponses automatiques ne DOIVENT JAMAIS être envoyées en réponse à un
	/// message NOTICE. Cette règle s'applique également aux serveurs, qui ne
	/// doivent PAS renvoyer de réponse d'erreur au client à la réception d'un
	/// message NOTICE. L'objectif de cette règle est d'éviter les boucles entre
	/// les clients qui envoient automatiquement une réponse à un message qu'ils
	/// ont reçu.
	///
	/// Cette commande est disponible pour les services comme pour les
	/// utilisateurs.
	///
	/// Elle est généralement utilisée par les services et les automates
	/// (clients dont les actions sont contrôlées par une IA ou un autre
	/// programme interactif).
	///
	/// Voir PRIVMSG/PUBMSG pour plus de détails sur les réponses et des
	/// exemples.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<NoticeCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for target in data.targets.iter() {
			let origin = Origin::from(client_socket.client());
			client_socket.emit_notice(target, &data.text, &origin);

			if client_socket.check_nickname(target) {
				continue;
			}

			let Some(target_client_socket) = app.find_socket_by_nickname(&socket, target) else {
				client_socket.send_err_nosuchnick(target);
				continue;
			};

			if app.client_isin_blocklist(&target_client_socket, &client_socket) {
				continue;
			}

			target_client_socket.emit_notice(target, &data.text, &origin);
		}
	}
}
