// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::client::{ClientSocketInterface, Socket};
use flex_chat::macros::command_response;
use serde_json::json;

use crate::features::chat::message::format_color::{
	MessageColors,
	MessageFormats,
};

command_response! {
	struct PRIVMSG<'target, 'text>
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

pub trait PrivmsgClientSocketCommandResponseInterface:
	ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /PRIVMSG <nickname>
	fn emit_privmsg(
		&self,
		target: &str,
		formats_colors: Option<(&MessageFormats, &MessageColors)>,
		text: &str,
		by: impl serde::Serialize,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> PrivmsgClientSocketCommandResponseInterface for Socket<'s>
{
	fn emit_privmsg(
		&self,
		target: &str,
		formats_colors: Option<(&MessageFormats, &MessageColors)>,
		text: &str,
		by: impl serde::Serialize,
	)
	{
		let mut tags = PrivmsgCommandResponse::default_tags();

		if let Some((formats, colors)) = formats_colors {
			tags.insert(
				String::from("format_bold"),
				json!(formats.format_bold),
			);
			tags.insert(
				String::from("format_italic"),
				json!(formats.format_italic),
			);
			tags.insert(
				String::from("format_underline"),
				json!(formats.format_underline),
			);

			tags.insert(
				String::from("color_background"),
				json!(colors.color_background),
			);
			tags.insert(
				String::from("color_foreground"),
				json!(colors.color_foreground),
			);
		}

		let privmsg_command = PrivmsgCommandResponse {
			origin: &by,
			target,
			text,
			tags,
		};
		_ = self.socket().emit(privmsg_command.name(), &privmsg_command);
	}
}
