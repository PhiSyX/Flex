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

use flex_chat_channel::{ChannelAccessLevel, ChannelMember, MemberID, MemberInterface};
use flex_chat_client::{Client, ClientInterface};
use flex_chat_macro::command_response;
use flex_chat_mode::ApplyMode;
use flex_chat_user::User;

command_response! {
	struct MODE<F>
	{
		target: &'a str,
		added: Vec<(char, ApplyMode<F>)>,
		removed: Vec<(char, ApplyMode<F>)>,
		updated: bool,
	}
}

#[derive(Debug)]
#[derive(serde::Serialize)]
#[derive(Clone)]
pub struct ChannelMemberDTO
{
	pub id: MemberID,
	#[serde(flatten)]
	pub user: User,
	/// Les modes de salon d'un pseudo.
	pub access_level: HashSet<ChannelAccessLevel>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl From<(Client, ChannelMember)> for ChannelMemberDTO
{
	fn from((client, channel_nick): (Client, ChannelMember)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level().clone(),
			user: client.user().to_owned(),
		}
	}
}

impl From<(&Client, ChannelMember)> for ChannelMemberDTO
{
	fn from((client, channel_nick): (&Client, ChannelMember)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level().clone(),
			user: client.user().to_owned(),
		}
	}
}

impl From<(Client, &ChannelMember)> for ChannelMemberDTO
{
	fn from((client, channel_nick): (Client, &ChannelMember)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level().clone(),
			user: client.user().to_owned(),
		}
	}
}

impl From<(&Client, &ChannelMember)> for ChannelMemberDTO
{
	fn from((client, channel_nick): (&Client, &ChannelMember)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level().clone(),
			user: client.user().to_owned(),
		}
	}
}

impl From<(Client, &&ChannelMember)> for ChannelMemberDTO
{
	fn from((client, channel_nick): (Client, &&ChannelMember)) -> Self
	{
		Self {
			id: client.cid(),
			access_level: channel_nick.access_level().clone(),
			user: client.user().to_owned(),
		}
	}
}
