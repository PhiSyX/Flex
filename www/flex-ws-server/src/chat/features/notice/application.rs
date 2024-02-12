// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::{channel, client};
use crate::src::chat::features::OperApplicationInterface;
use crate::src::ChatApplication;

pub trait NoticeApplicationInterface
{
	/// Le client peut-il écrire sur le salon?
	fn is_client_able_to_notice_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	) -> channel::permission::ChannelWritePermission;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl NoticeApplicationInterface for ChatApplication
{
	fn is_client_able_to_notice_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	) -> channel::permission::ChannelWritePermission
	{
		use channel::permission::ChannelWritePermission;

		let Some(channel) = self.get_channel(channel_name) else {
			return ChannelWritePermission::No;
		};

		let moderate_flag = channel.modes_settings.has_moderate_flag();
		let no_external_messages_flag = channel.modes_settings.has_no_external_messages_flag();

		// NOTE(phisyx): pour le futur, vérifier que celui qui essaie d'écrire
		// dans le salon n'est pas bannie.

		let Some(member) = channel.member(client_socket.cid()) else {
			if self.is_client_global_operator(client_socket) {
				return ChannelWritePermission::Bypass;
			}

			if moderate_flag || no_external_messages_flag {
				return ChannelWritePermission::No;
			}

			return ChannelWritePermission::Bypass;
		};

		if self.is_client_global_operator(client_socket) {
			return ChannelWritePermission::Yes(member.clone());
		}

		if moderate_flag
			&& member
				.highest_access_level()
				.filter(|level| level.flag() >= channel::mode::ChannelAccessLevel::Vip.flag())
				.is_none()
		{
			return ChannelWritePermission::No;
		}

		ChannelWritePermission::Yes(member.clone())
	}
}
