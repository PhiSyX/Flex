// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::{ErrInviteonlychanError, InviteCommandResponse, RplInvitingReply};
use crate::src::chat::components::client::{self, Origin};
use crate::src::chat::components::{self, ClientSocketInterface};

// --------- //
// Interface //
// --------- //

pub trait InviteChannelClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /INVITE (sender + recv).
	fn emit_invite(&self, channel: &components::Channel, target: Self)
	where
		Self: Sized,
	{
		self.send_rpl_inviting(channel, &target.user().nickname);

		let client_origin = Origin::from(self.client());
		let invite_command = InviteCommandResponse {
			origin: &client_origin,
			tags: InviteCommandResponse::default_tags(),
			channel: &channel.name,
			nick: &target.user().nickname,
		};

		self.emit(invite_command.name(), &invite_command);

		target.emit(invite_command.name(), invite_command);
	}

	/// Émet au client les réponses liées à la commande /INVITE (sender).
	fn send_rpl_inviting(&self, channel: &components::Channel, target: impl AsRef<str>)
	{
		let origin = Origin::from(self.client());
		let rpl_inviting = RplInvitingReply {
			origin: &origin,
			tags: RplInvitingReply::default_tags(),
			channel: &channel.name,
			nick: target.as_ref(),
		};
		self.emit(rpl_inviting.name(), rpl_inviting);
	}
}

pub trait InviteChannelClientSocketErrorReplies: ClientSocketInterface
{
	fn send_err_inviteonlychan(&self, channel: impl AsRef<str>)
	{
		let origin = Origin::from(self.client());
		let err_inviteonlychan = ErrInviteonlychanError {
			origin: &origin,
			tags: ErrInviteonlychanError::default_tags(),
			channel: channel.as_ref(),
		};
		self.emit(err_inviteonlychan.name(), err_inviteonlychan);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> InviteChannelClientSocketCommandResponseInterface for client::Socket<'s> {}
impl<'s> InviteChannelClientSocketErrorReplies for client::Socket<'s> {}
