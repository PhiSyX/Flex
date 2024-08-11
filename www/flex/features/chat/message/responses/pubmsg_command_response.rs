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
use serde_json::json;

use crate::features::chat::message::format_color::{MessageColors, MessageFormats};

command_response! {
	struct PUBMSG<'channel, 'text>
	{
		/// Le salon.
		channel: &'channel str,
		/// Le texte.
		text: &'text str,
		/// Message venant de l'extérieur?
		external: bool,
	}
}

// --------- //
// Interface //
// --------- //

pub trait PubmsgClientSocketCommandResponseInterface
	: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client courant les réponses liées à la commande /PUBMSG
	/// <channel>
	fn emit_pubmsg<MemberDTO>(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		formats_colors: Option<(&MessageFormats, &MessageColors)>,
		text: &str,
		by: &MemberDTO,
	) where
		MemberDTO: serde::Serialize;

	/// Émet au client courant les réponses liées à la commande /PUBMSG
	/// <channel>
	fn emit_external_pubmsg(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		formats_colors: Option<(&MessageFormats, &MessageColors)>,
		text: &str,
		by: &<Self::Client as ClientInterface>::User,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> PubmsgClientSocketCommandResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn emit_pubmsg<MemberDTO>(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		formats_colors: Option<(&MessageFormats, &MessageColors)>,
		text: &str,
		by: &MemberDTO,
	) where
		MemberDTO: serde::Serialize,
	{
		let mut tags = PubmsgCommandResponse::default_tags();
		
		if let Some((formats, colors)) = formats_colors {
			tags.insert(String::from("format_bold"), json!(formats.format_bold));
			tags.insert(String::from("format_italic"), json!(formats.format_italic));
			tags.insert(String::from("format_underline"), json!(formats.format_underline));

			tags.insert(String::from("color_background"), json!(colors.color_background));
			tags.insert(String::from("color_foreground"), json!(colors.color_foreground));
		}

		let pubmsg_command = PubmsgCommandResponse {
			origin: &by,
			tags,
			channel: channel_name,
			text,
			external: false,
		};

		_ = self.socket().emit(pubmsg_command.name(), &pubmsg_command);

		let target_room = format!("channel:{}", channel_name.to_lowercase());

		_ = self.socket()
			.except(self.useless_people_room())
			.to(target_room)
			.emit(pubmsg_command.name(), pubmsg_command);
	}

	fn emit_external_pubmsg(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		formats_colors: Option<(&MessageFormats, &MessageColors)>,
		text: &str,
		by: &<Self::Client as ClientInterface>::User,
	)
	{
		let mut tags = PubmsgCommandResponse::default_tags();
		
		if let Some((formats, colors)) = formats_colors {
			tags.insert(String::from("format_bold"), json!(formats.format_bold));
			tags.insert(String::from("format_italic"), json!(formats.format_italic));
			tags.insert(String::from("format_underline"), json!(formats.format_underline));

			tags.insert(String::from("color_background"), json!(colors.color_background));
			tags.insert(String::from("color_foreground"), json!(colors.color_foreground));
		}

		let pubmsg_command = PubmsgCommandResponse {
			origin: &by,
			tags,
			channel: channel_name,
			text,
			external: true,
		};

		_ = self.socket().emit(pubmsg_command.name(), &pubmsg_command);

		let target_room = format!("channel:{}", channel_name.to_lowercase());

		_ = self
			.socket()
			.except(self.useless_people_room())
			.to(target_room)
			.emit(pubmsg_command.name(), pubmsg_command);
	}
}
