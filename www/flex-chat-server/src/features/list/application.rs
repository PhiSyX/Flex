// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{Channel, ChannelInterface};
use flex_chat_client::{
	ClientInterface,
	ClientServerApplicationInterface,
	ClientSocketInterface,
	Socket,
};

use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait ListApplicationInterface
{
	type Channel: ChannelInterface;
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Est-ce qu'un client a un salon donné dans sa liste de salons rejoint.
	fn is_client_has_channel(
		&self,
		client_id: &<<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> bool;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ListApplicationInterface for ChatApplication
{
	type Channel = Channel;
	type ClientSocket<'cs> = Socket<'cs>;

	fn is_client_has_channel(
		&self,
		client_id: &<<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> bool
	{
		let Some(client) = self.get_client_by_id(client_id) else {
			return false;
		};
		client.has_channel(channel_name)
	}
}
