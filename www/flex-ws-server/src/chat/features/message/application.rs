// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{
	ChannelAccessControlInterface,
	ChannelAccessLevel,
	ChannelMemberInterface,
	ChannelNameSRef,
	ChannelNoPermissionCause,
	ChannelWritePermission,
	MemberInterface,
};
use flex_chat_client::{ClientSocketInterface, Socket};

use crate::src::chat::features::OperApplicationInterface;
use crate::src::ChatApplication;

pub trait MessageApplicationInterface
{
	/// Le client peut-il écrire sur le salon?
	fn is_client_able_to_write_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
	) -> ChannelWritePermission;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl MessageApplicationInterface for ChatApplication
{
	fn is_client_able_to_write_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
	) -> ChannelWritePermission
	{
		let Some(channel) = self.get_channel(channel_name) else {
			return ChannelWritePermission::No(ChannelNoPermissionCause::ERR_NOSUCHCHANNEL);
		};

		let moderate_flag = channel.modes_settings.has_moderate_flag();
		let no_external_messages_flag = channel.modes_settings.has_no_external_messages_flag();

		let Some(member) = channel.member(client_socket.cid()) else {
			if self.is_client_global_operator(client_socket) {
				return ChannelWritePermission::Bypass;
			}

			if moderate_flag {
				return ChannelWritePermission::No(ChannelNoPermissionCause::ERR_CHANISINMODERATED);
			}

			if no_external_messages_flag {
				return ChannelWritePermission::No(ChannelNoPermissionCause::ERR_NOTMEMBEROFCHAN);
			}

			return ChannelWritePermission::Bypass;
		};

		if self.is_client_global_operator(client_socket) {
			return ChannelWritePermission::Yes(member.clone());
		}
		let member_hal = member.highest_access_level();

		if channel.is_banned(client_socket.user()) && member_hal.is_none() {
			return ChannelWritePermission::No(ChannelNoPermissionCause::ERR_BANNEDFROMCHAN);
		}

		if moderate_flag
			&& member_hal
				.filter(|level| level.flag() >= ChannelAccessLevel::Vip.flag())
				.is_none()
		{
			return ChannelWritePermission::No(ChannelNoPermissionCause::ERR_CHANISINMODERATED);
		}

		ChannelWritePermission::Yes(member.clone())
	}
}
