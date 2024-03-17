// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{ChannelMemberInterface, ChannelsSessionInterface};
use flex_chat_client::{Client, ClientInterface};

use crate::features::chat::sessions::ChannelsSession;

// --------- //
// Interface //
// --------- //

pub trait PartChannelsSessionInterface: ChannelsSessionInterface
{
	type Client: ClientInterface;

	/// Supprime un client de tous ses salons.
	fn remove_client_from_all_his_channels(&self, client: &Self::Client) -> Option<()>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl PartChannelsSessionInterface for ChannelsSession
{
	type Client = Client;

	fn remove_client_from_all_his_channels(&self, client: &Self::Client) -> Option<()>
	{
		for channel_id in client.channels() {
			let mut channel = self.get_mut(channel_id)?;
			channel.members_mut().remove(client.cid());
			if channel.members().is_empty() {
				drop(channel);
				self.remove(channel_id);
				continue;
			}
		}
		Some(())
	}
}
