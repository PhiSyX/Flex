// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashSet;

use crate::src::chat::components::channel::nick;
use crate::src::chat::components::{client, user};
use crate::{command_response, reserved_numerics};

reserved_numerics! {
	| 353 <-> RPL_NAMREPLY {
		visibility: str,
		channel: str,
		nicks: str
	}
		=> "{visibility} {channel} :{nicks}"
}

reserved_numerics! {
	| 366 <-> RPL_ENDOFNAMES {
		channel: str
	} => "{channel} :Fin de la liste `/NAMES`"
}

command_response! {
	struct RPL_NAMREPLY
	{
		code: u16,
		channel: &'a str,
		users: Vec<ChannelNickClient>,
	}
}

impl<'c> RplNamreplyCommandResponse<'c>
{
	pub fn code() -> u16
	{
		353
	}
}

#[derive(Debug)]
#[derive(serde::Serialize)]
#[derive(Clone)]
pub struct ChannelNickClient
{
	pub id: client::ClientID,
	#[serde(flatten)]
	pub user: user::User,
	/// Les modes de salon d'un pseudo.
	pub access_level: HashSet<nick::ChannelAccessLevel>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl From<(client::Client, nick::ChannelNick)> for ChannelNickClient
{
	fn from((client, channel_nick): (client::Client, nick::ChannelNick)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level,
			user: client.user().to_owned(),
		}
	}
}

impl From<(&client::Client, nick::ChannelNick)> for ChannelNickClient
{
	fn from((client, channel_nick): (&client::Client, nick::ChannelNick)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level,
			user: client.user().to_owned(),
		}
	}
}

impl From<(client::Client, &nick::ChannelNick)> for ChannelNickClient
{
	fn from((client, channel_nick): (client::Client, &nick::ChannelNick)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level.clone(),
			user: client.user().to_owned(),
		}
	}
}

impl From<(&client::Client, &nick::ChannelNick)> for ChannelNickClient
{
	fn from((client, channel_nick): (&client::Client, &nick::ChannelNick)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level.clone(),
			user: client.user().to_owned(),
		}
	}
}

impl From<(client::Client, &&nick::ChannelNick)> for ChannelNickClient
{
	fn from((client, channel_nick): (client::Client, &&nick::ChannelNick)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level.clone(),
			user: client.user().to_owned(),
		}
	}
}
