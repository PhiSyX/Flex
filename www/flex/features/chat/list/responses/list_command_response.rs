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
	Channel,
	ChannelInterface,
	ChannelMemberInterface,
	ChannelTopicInterface,
};
use flex_chat_client::{ClientSocketInterface, Origin, Socket};

use super::{RplListReply, RplListendReply, RplListstartReply};

// --------- //
// Interface //
// --------- //

pub trait ListChannelClientSocketCommandResponseInterface
	: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client les réponses liées à la commande /LIST (2).
	fn send_rpl_list(&self, channel: &Self::Channel);

	/// Émet au client les réponses liées à la commande /LIST (3).
	fn send_rpl_listend(&self)
	{
		let origin = Origin::from(self.client());
		let rpl_listend = RplListendReply {
			origin: &origin,
			tags: RplListendReply::default_tags(),
		};
		self.emit(rpl_listend.name(), rpl_listend);
	}

	/// Émet au client les réponses liées à la commande /LIST (1).
	fn send_rpl_liststart(&self)
	{
		let origin = Origin::from(self.client());
		let rpl_liststart = RplListstartReply {
			origin: &origin,
			tags: RplListstartReply::default_tags(),
		};
		self.emit(rpl_liststart.name(), rpl_liststart);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ListChannelClientSocketCommandResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn send_rpl_list(&self, channel: &Self::Channel)
	{
		let origin = Origin::from(self.client());

		let mode_settings = channel.modes_settings.to_string();
		let topic = channel.topic_text();
		let total_members = channel.members().len();

		let rpl_list = RplListReply {
			origin: &origin,
			tags: RplListReply::default_tags(),
			channel: channel.name(),
			modes_settings: &mode_settings,
			topic,
			total_members: &total_members,
		};
		self.emit(rpl_list.name(), rpl_list);
	}
}
