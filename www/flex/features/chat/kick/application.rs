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
	Channel,
	ChannelAccessLevel,
	ChannelInterface,
	ChannelsSessionInterface,
};
use flex_chat::client::channel::responses::ChannelClientSocketErrorReplies;
use flex_chat::client::nick::responses::NickClientSocketErrorReplies;
use flex_chat::client::{ClientSocketInterface, Socket};
use flex_chat::user::UserFlagInterface;

use super::{
	KickChannelClientSocketCommandResponseInterface,
	KickChannelClientSocketErrorRepliesInterface,
};
use crate::features::chat::mode::ModeChannelAccessLevelChannelsSessionInterface;
use crate::features::chat::oper::OperApplicationInterface;
use crate::features::chat::part::PartChannelApplicationInterface;
use crate::features::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait KickApplicationInterface
{
	type Channel: ChannelInterface;
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Sanctionne un membre d'un salon
	fn kick_clients_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		knicks: &[String],
		comment: Option<&str>,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl KickApplicationInterface for ChatApplication
{
	type Channel = Channel;
	type ClientSocket<'cs> = Socket<'cs>;

	#[rustfmt::skip]
	fn kick_clients_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		knicks: &[String],
		comment: Option<&str>,
	)
	{
		// NOTE: utilisateur / opérateur global / membre du salon / opérateur du
		// salon / victime.

		let is_client_globop = self.is_client_global_operator(client_socket);

		// NOTE: opérateur global (2).

		if is_client_globop {
			for nickname in knicks.iter() {
				let Some(knick_client_socket) = self.find_socket_by_nickname(
					client_socket.socket(),
					nickname,
				) else {
					client_socket.send_err_nosuchnick(nickname);
					continue;
				};

				// NOTE: la victime (1/5) n'est pas membre du salon (3).
				if !self.channels.has_member(channel_name, knick_client_socket.cid()) {
					client_socket.send_err_usernotinchannel(channel_name, nickname);
					continue;
				}

				// NOTE: un opérateur global (2) PEUT sanctionner même s'il
				//       n'est pas présent dans le salon en question. Ce qui a
				//       pour conséquence que si le membre du salon (3) était
				//       seul dans le salon, le salon est supprimé.
				let channel_not_removed = self.remove_member_from_channel(
					channel_name,
					&knick_client_socket,
				);

				if channel_not_removed.is_some() {
					let Some(channel) = self.channels.get(channel_name) else {
						client_socket.send_err_nosuchchannel(channel_name);
						continue;
					};

					client_socket.emit_kick(
						&channel,
						&knick_client_socket,
						comment,
					);
				} else {
					// TODO: envoyer une SNotice de succès à l'opérateur global
					// (2).
				}
			}

			return;
		}

		// NOTE: utilisateur (1).

		// NOTE: l'utilisateur (1) n'est pas membre du salon.
		if !self.channels.has_member(channel_name, client_socket.cid()) {
			client_socket.send_err_notonchannel(channel_name);
			return;
		}

		// NOTE: le membre du salon (3) n'a pas les droits minimales de
		// 		 sanctionner dans le salon.
		if !self.channels.does_member_have_rights(
			channel_name,
			client_socket.cid(),
			ChannelAccessLevel::HalfOperator,
		) {
			client_socket.send_err_chanoprivsneeded(channel_name);
			return;
		}

		// NOTE: opérateur de salon (4) avec les bonnes permissions.

		for nickname in knicks.iter() {
			let Some(knick_client_socket) = self.find_socket_by_nickname(
				client_socket.socket(),
				nickname,
			) else {
				client_socket.send_err_nosuchnick(nickname);
				continue;
			};

			// NOTE: la victime (1/5) n'est pas membre du salon (3).
			if !self.channels.has_member(channel_name, knick_client_socket.cid())
			{
				client_socket.send_err_usernotinchannel(channel_name, nickname);
				continue;
			}

			// NOTE: la victime (5) possède un drapeau 'q' dans ses drapeaux
			// 		 utilisateur (1) ce qui le rend non sanctionable d'un KICK.
			if knick_client_socket.user().has_nokick_flag() {
				client_socket
					.send_err_cannotkickglobops(channel_name, nickname);
				continue;
			}

			// NOTE: l'opérateur de salon (4) n'a pas les droits d'opérer sur la
			//       victime (5) qui se trouve être un opérateur de salon plus
			//       haut gradé (4).
			if !self.channels.does_member_have_rights_to_operate_on_another_member(
				channel_name,
				client_socket.cid(),
				knick_client_socket.cid(),
			) {
				client_socket.send_err_chanoprivsneeded(channel_name);
				continue;
			}

			// NOTE: cela ne devrait jamais arriver à ce stade, mais sait-on
			// 		 jamais.
			let Some(channel) = self.channels.get(channel_name) else {
				client_socket.send_err_nosuchchannel(channel_name);
				continue;
			};

			client_socket.emit_kick(&channel, &knick_client_socket, comment);
			drop(channel);

			// NOTE: on est assuré par les conditions ci-hautes que l'opérateur
			//       de salon (4) est un membre du salon (3). Ce qui signifie
			//       que le salon NE PEUT PAS être supprimé après un KICK d'un
			//       membre de salon (3). Cependant, nous ne sommes pas assurer
			//       que l'opérateur de salon (4) se sanctionne lui-même. ;-)
			self.remove_member_from_channel(channel_name, &knick_client_socket);
		}
	}
}
