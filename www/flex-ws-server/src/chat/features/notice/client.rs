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
	/// Émet au client les réponses liées à la commande /NOTICE <nickname>
	fn emit_notice_on_nick<User>(&self, target: &str, text: &str, by: User)
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

	/// Émet au client les réponses liées à la commande /NOTICE <channel>
	fn emit_notice_on_channel<User>(&self, target: &str, text: &str, by: User)
	where
		User: serde::Serialize,
	{
		let notice_command = NoticeCommandResponse {
			origin: &by,
			tags: NoticeCommandResponse::default_tags(),
			target,
			text,
		};

		_ = self.socket().emit(notice_command.name(), &notice_command);

		let target_room = format!("channel:{}", target.to_lowercase());

		_ = self
			.socket()
			.except(self.useless_people_room())
			.to(target_room)
			.emit(notice_command.name(), notice_command);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> NoticeClientSocketCommandResponseInterface for client::Socket<'s> {}
