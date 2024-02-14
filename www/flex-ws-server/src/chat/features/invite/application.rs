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
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait InviteApplicationInterface
{
	/// Ajoute un client dans la liste des invitations d'un salon.
	fn add_client_to_invite_channel(
		&self,
		channel: channel::ChannelIDRef,
		client_invite_id: client::ClientID,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl InviteApplicationInterface for ChatApplication
{
	fn add_client_to_invite_channel(
		&self,
		channel_id: channel::ChannelIDRef,
		client_invite_id: client::ClientID,
	)
	{
		let Some(mut channel) = self.channels.get_mut(channel_id) else {
			return;
		};
		channel.add_invite(client_invite_id);
	}
}
