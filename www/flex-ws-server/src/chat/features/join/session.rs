// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::secret;

use super::JoinChannelError;
use crate::src::chat::components::{channel, client};
use crate::src::chat::sessions::ChannelsSession;

// --------- //
// Interface //
// --------- //

pub trait JoinChannelSessionInterface
{
	/// Est-ce que le client PEUT rejoindre le salon
	fn can_join(
		&self,
		channel_id: channel::ChannelIDRef,
		maybe_user_channel_key: Option<&secret::Secret<String>>,
		client: &client::Client,
	) -> Result<(), JoinChannelError>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl JoinChannelSessionInterface for ChannelsSession
{
	fn can_join(
		&self,
		channel_id: channel::ChannelIDRef,
		maybe_user_channel_key: Option<&secret::Secret<String>>,
		client: &client::Client,
	) -> Result<(), JoinChannelError>
	{
		let channel = self
			.get(channel_id)
			.expect("à cette étape, le salon DOIT forcément exister");

		if channel.modes_settings.has_key_flag() {
			if let Some(user_channel_key) = maybe_user_channel_key {
				if !channel.modes_settings.contains_key_flag(user_channel_key) {
					return Err(JoinChannelError::BadChannelKey);
				}
			} else {
				return Err(JoinChannelError::BadChannelKey);
			}
		}

		if self.has_member(channel_id, client.id()) {
			return Err(JoinChannelError::HasAlreadyClient);
		}

		if channel.modes_settings.has_operonly_flag() && !client.user().is_operator() {
			return Err(JoinChannelError::OperOnly);
		}

		Ok(())
	}
}