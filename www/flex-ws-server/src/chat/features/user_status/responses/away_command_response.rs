// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientSocketInterface, Origin, Socket};
use flex_chat_user::{UserAwayInterface, UserInterface};

use super::{RplAwayReply, RplNowawayReply, RplUnawayReply};

// --------- //
// Interface //
// --------- //

pub trait UserStatusClientSocketInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /AWAY + /PRIVMSG
	fn send_rpl_away(&self, target_client_socket: &Self)
	{
		let origin = Origin::from(target_client_socket.client());
		let message = target_client_socket.user().away_message();
		let rpl_away = RplAwayReply {
			origin: &origin,
			tags: RplAwayReply::default_tags(),
			message: &message,
			nick: target_client_socket.user().nickname(),
		};
		self.emit(rpl_away.name(), rpl_away);
	}

	/// Émet au client les réponses liées à la commande /AWAY.
	fn send_rpl_nowaway(&self)
	{
		let origin = Origin::from(self.client());
		let rpl_nowaway = RplNowawayReply {
			origin: &origin,
			tags: RplNowawayReply::default_tags(),
		};
		self.emit(rpl_nowaway.name(), rpl_nowaway);
	}

	/// Émet au client les réponses liées à la commande /AWAY.
	fn send_rpl_unaway(&self)
	{
		let origin = Origin::from(self.client());
		let rpl_nowaway = RplUnawayReply {
			origin: &origin,
			tags: RplUnawayReply::default_tags(),
		};
		self.emit(rpl_nowaway.name(), rpl_nowaway);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> UserStatusClientSocketInterface for Socket<'s> {}
