// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{ChannelAccessLevel, ChannelWritePermission, MemberInterface};
use flex_chat_client::{ClientSocketInterface, Origin};
use socketioxide::extract::{Data, SocketRef, State};

use crate::src::features::notice::{
	NoticeClientSocketCommandResponseInterface,
	NoticeCommandFormData,
};
use crate::src::features::{
	ChannelMemberDTO,
	NoticeApplicationInterface,
	SilenceApplicationInterface,
};
use crate::src::ChatApplication;

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
			const CHANNEL_PREFIXES: [char; 5] = ['~', '&', '@', '%', '+'];

			if target.starts_with(CHANNEL_PREFIXES) && target.contains('#') {
				let mut prefixes = target.matches(CHANNEL_PREFIXES);

				// SAFETY(unwrap): on est sûr qu'il existe au moins un préfixe.
				// De plus, le parsing sur l'un de ces prefixes ne peut pas
				// échouer.
				let last_prefix: ChannelAccessLevel =
					prefixes.next_back().unwrap().parse().unwrap();
				let target_without_prefixes =
					String::from(target.trim_start_matches(CHANNEL_PREFIXES));

				match app
					.is_client_able_to_notice_on_channel(&client_socket, &target_without_prefixes)
				{
					| ChannelWritePermission::Yes(member) => {
						if member
							.highest_access_level()
							.filter(|hal| hal.flag() >= last_prefix.flag())
							.is_none()
						{
							continue;
						}

						let channel_member =
							ChannelMemberDTO::from((client_socket.client(), member));
						client_socket.emit_notice_on_prefixed_channel(
							last_prefix.symbol(),
							&target_without_prefixes,
							&data.text,
							channel_member,
						);
					}
					| ChannelWritePermission::Bypass => {
						client_socket.emit_notice_on_prefixed_channel(
							last_prefix.symbol(),
							&target_without_prefixes,
							&data.text,
							client_socket.user(),
						);
					}
					| ChannelWritePermission::No(_) => {
						continue;
					}
				}

				continue;
			}

			if target.starts_with('#') {
				match app.is_client_able_to_notice_on_channel(&client_socket, target) {
					| ChannelWritePermission::Yes(member) => {
						let channel_member =
							ChannelMemberDTO::from((client_socket.client(), member));
						client_socket.emit_notice_on_channel(target, &data.text, &channel_member);
					}
					| ChannelWritePermission::Bypass => {
						client_socket.emit_external_notice_on_channel(
							target,
							&data.text,
							client_socket.user(),
						);
					}
					| ChannelWritePermission::No(_) => {
						continue;
					}
				}

				continue;
			}

			let origin = Origin::from(client_socket.client());
			client_socket.emit_notice_on_nick(target, &data.text, &origin);

			if client_socket.check_nickname(target) {
				continue;
			}

			let Some(target_client_socket) = app.find_socket_by_nickname(&socket, target) else {
				continue;
			};

			if app.client_isin_blocklist(&target_client_socket, &client_socket) {
				continue;
			}

			target_client_socket.emit_notice_on_nick(target, &data.text, &origin);
		}
	}
}
