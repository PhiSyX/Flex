// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{Channel, ChannelInterface};
use flex_chat::client::{ClientInterface, ClientSocketInterface, Socket};
use flex_chat::macros::command_response;

command_response! {
	struct NOTICE<'target, 'text>
	{
		/// La cible du message.
		target: &'target str,
		/// Le texte.
		text: &'text str,
	}
}

// --------- //
// Interface //
// --------- //

#[rustfmt::skip]
pub trait NoticeClientSocketCommandResponseInterface
	: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client les réponses liées à la commande /NOTICE <nickname>
	fn emit_notice_on_nick(
		&self,
		target: &str,
		text: &str,
		by: impl serde::Serialize,
	);

	/// Émet au client les réponses liées à la commande /NOTICE <channel>
	fn emit_external_notice_on_channel(
		&self,
		target: &str,
		text: &str,
		by: &<Self::Client as ClientInterface>::User,
	);

	/// Émet au client les réponses liées à la commande /NOTICE <channel>
	fn emit_notice_on_channel(
		&self,
		target: &str,
		text: &str,
		by: &impl serde::Serialize,
	);

	/// Émet au client les réponses liées à la commande
	/// /NOTICE <<prefix>channel>
	fn emit_notice_on_prefixed_channel(
		&self,
		prefix: char,
		target: &str,
		text: &str,
		by: impl serde::Serialize,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> NoticeClientSocketCommandResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn emit_notice_on_nick(
		&self,
		target: &str,
		text: &str,
		by: impl serde::Serialize,
	)
	{
		let notice_command = NoticeCommandResponse {
			origin: &by,
			target,
			text,
			tags: NoticeCommandResponse::default_tags(),
		};

		_ = self.socket().emit(notice_command.name(), &notice_command);
	}

	fn emit_external_notice_on_channel(
		&self,
		target: &str,
		text: &str,
		by: &<Self::Client as ClientInterface>::User,
	)
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

	fn emit_notice_on_channel(
		&self,
		target: &str,
		text: &str,
		by: &impl serde::Serialize,
	)
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

	fn emit_notice_on_prefixed_channel(
		&self,
		prefix: char,
		target: &str,
		text: &str,
		by: impl serde::Serialize,
	)
	{
		let notice_command = NoticeCommandResponse {
			origin: &by,
			tags: NoticeCommandResponse::default_tags(),
			target,
			text,
		};

		_ = self.socket().emit(notice_command.name(), &notice_command);

		let target_room =
			format!("channel:{}{}", prefix, target.to_lowercase());

		_ = self
			.socket()
			.except(self.useless_people_room())
			.to(target_room)
			.emit(notice_command.name(), notice_command);
	}
}
