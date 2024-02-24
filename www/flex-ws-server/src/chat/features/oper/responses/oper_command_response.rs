// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{self, ClientSocketInterface, Origin, Socket};
use flex_chat_user::Flag;

use super::RplYoureoperReply;

// --------- //
// Interface //
// --------- //

pub trait OperClientSocketCommandResponse: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /OPER.
	fn send_rpl_youreoper(&self, oper_type: &Flag)
	{
		let origin = Origin::from(self.client());
		let rpl_youreoper = RplYoureoperReply {
			origin: &origin,
			tags: RplYoureoperReply::default_tags(),
			oper_type,
		};
		self.emit(rpl_youreoper.name(), rpl_youreoper);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> OperClientSocketCommandResponse for Socket<'s> {}
