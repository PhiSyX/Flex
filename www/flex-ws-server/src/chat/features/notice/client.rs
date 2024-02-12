// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::NoticeCommandResponse;
use crate::src::chat::components::{client, ClientSocketInterface};

// --------- //
// Interface //
// --------- //

pub trait NoticeClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /NOTICE <target>
	fn emit_notice<User>(&self, target: &str, text: &str, by: User)
	where
		User: serde::Serialize,
	{
		let notice_command = NoticeCommandResponse {
			origin: &by,
			target,
			text,
			tags: NoticeCommandResponse::default_tags(),
		};

		_ = self.socket().emit(notice_command.name(), &notice_command);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> NoticeClientSocketCommandResponseInterface for client::Socket<'s> {}
