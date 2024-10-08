// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{
	ChannelAccessLevel,
	ChannelInterface,
	ChannelMemberInterface,
};
use flex_chat::client::channel::responses::ChannelClientSocketErrorReplies;
use flex_chat::client::nick::responses::NickClientSocketErrorReplies;
use flex_chat::client::ClientSocketInterface;
use flex_chat::user::UserInterface;
use flex_web_framework::WebSocketHandler;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::invite::{
	InviteApplicationInterface,
	InviteClientSocketCommandResponseInterface,
	InviteCommandFormData,
};
use crate::features::chat::mode::ModeChannelAccessLevelApplicationInterface;
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct InviteHandler;

// -------------- //
// Implémentation //
// -------------- //

impl WebSocketHandler for InviteHandler
{
	type App = ChatApplication;
	type Data = InviteCommandFormData;

	const EVENT_NAME: &'static str = "INVITE";

	/// La commande INVITE est utilisée pour inviter un utilisateur à un salon.
	/// Le paramètre <nickname> est le surnom de la personne à inviter dans le
	/// salon cible <channel>.  Il n'est pas nécessaire que le salon auquel
	/// l'utilisateur cible est invité existe ou soit valide. Toutefois, si le
	/// salon existe, seuls les membres du salon sont autorisés à inviter
	/// d'autres utilisateurs. Lorsque le salon a le drapeau "invitation
	/// seulement" activé, seuls les opérateurs du salon peuvent émettre la
	/// commande INVITE. Seuls l'utilisateur invitant et l'utilisateur invité
	/// recevront une notification de l'invitation.  Les autres membres du salon
	/// n'en sont pas informés. (Contrairement aux changements de MODE et c'est
	/// parfois la source de problèmes pour les utilisateurs).
	fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<InviteCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		let Some(target_client_socket) =
			app.find_socket_by_nickname(&socket, &data.nickname)
		else {
			client_socket.send_err_nosuchnick(&data.nickname);
			return;
		};
		let Some(channel) = app.get_channel(&data.channel) else {
			client_socket.send_err_nosuchchannel(&data.channel);
			return;
		};

		if channel.member(target_client_socket.cid()).is_some() {
			client_socket.send_err_useronchannel(
				target_client_socket.user().nickname(),
				channel.name(),
			);
			return;
		}

		let has_channel_invite_flag =
			channel.modes_settings.has_invite_only_flag();
		let is_member_has_rights = app.does_client_have_rights_on_channel(
			&client_socket,
			&data.channel,
			ChannelAccessLevel::Operator,
		);

		if has_channel_invite_flag && !is_member_has_rights {
			client_socket.send_err_chanoprivsneeded(&channel.name);
			return;
		}

		client_socket.emit_invite(&channel, &target_client_socket);

		drop(channel);

		app.add_user_to_invite_channel(
			data.channel.as_ref(),
			*target_client_socket.cid(),
		);
	}
}
