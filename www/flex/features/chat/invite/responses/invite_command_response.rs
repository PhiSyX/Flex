// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{Channel, ChannelInterface};
use flex_chat_client::{ClientSocketInterface, Origin, Socket};
use flex_chat_macro::command_response;
use flex_chat_user::UserInterface;

use super::RplInvitingReply;

command_response! {
	struct INVITE<'channel, 'nick>
	{
		/// Le salon que le client a reçu comme invitation.
		channel: &'channel str,
		/// Le pseudo qui a été invité.
		nick: &'nick str,
	}
}

// --------- //
// Interface //
// --------- //

pub trait InviteClientSocketCommandResponseInterface
	: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client les réponses liées à la commande /INVITE (sender + recv).
	fn emit_invite(&self, channel: &Self::Channel, target: &Self);

	/// Émet au client les réponses liées à la commande /INVITE (sender).
	fn send_rpl_inviting(&self, channel: &Self::Channel, target: &str);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> InviteClientSocketCommandResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn emit_invite(&self, channel: &Self::Channel, target: &Self)
	{
		self.send_rpl_inviting(channel, target.user().nickname());

		let client_origin = Origin::from(self.client());
		let invite_command = InviteCommandResponse {
			origin: &client_origin,
			tags: InviteCommandResponse::default_tags(),
			channel: channel.name(),
			nick: target.user().nickname(),
		};

		self.emit(invite_command.name(), &invite_command);

		target.emit(invite_command.name(), invite_command);
	}

	fn send_rpl_inviting(&self, channel: &Self::Channel, target: &str)
	{
		let origin = Origin::from(self.client());
		let rpl_inviting = RplInvitingReply {
			origin: &origin,
			tags: RplInvitingReply::default_tags(),
			channel: channel.name(),
			nick: target,
		};
		self.emit(rpl_inviting.name(), rpl_inviting);
	}
}
