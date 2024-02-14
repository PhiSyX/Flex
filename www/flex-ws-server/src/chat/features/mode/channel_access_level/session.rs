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
use crate::src::chat::sessions::ChannelsSession;

// --------- //
// Interface //
// --------- //

pub trait ModeChannelAccessLevelChannelsSessionInterface
{
	/// Est-ce qu'un membre à des droits minimal.
	fn does_member_have_rights(
		&self,
		channel_id: channel::ChannelIDRef,
		client_id: &client::ClientID,
		min_access_level: channel::mode::ChannelAccessLevel,
	) -> bool;

	/// Un membre PEUT-il effectuer des tâches sur un autre membre?
	fn does_member_have_rights_to_operate_on_another_member(
		&self,
		channel_id: channel::ChannelIDRef,
		client_id: &client::ClientID,
		user_id: &client::ClientID,
	) -> bool;

	/// Supprime le niveau d'accès d'un pseudo.
	fn remove_client_access_level(
		&self,
		channel_id: &str,
		client_id: &client::ClientID,
		access_level: channel::mode::ChannelAccessLevel,
	) -> Option<channel::member::ChannelMember>;

	/// Met à jour le niveau d'accès d'un pseudo.
	fn update_client_access_level(
		&self,
		channel_id: &str,
		client_id: &client::ClientID,
		access_level: channel::mode::ChannelAccessLevel,
	) -> Option<channel::member::ChannelMember>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ModeChannelAccessLevelChannelsSessionInterface for ChannelsSession
{
	fn does_member_have_rights(
		&self,
		channel_id: channel::ChannelIDRef,
		member_id: &client::ClientID,
		min_access_level: channel::mode::ChannelAccessLevel,
	) -> bool
	{
		let Some(member) = self.get_member(channel_id, member_id) else {
			return false;
		};

		member
			.access_level()
			.iter()
			.any(|access_level| access_level.flag() >= min_access_level.flag())
	}

	fn does_member_have_rights_to_operate_on_another_member(
		&self,
		channel_id: channel::ChannelIDRef,
		member_id: &client::ClientID,
		other_member_id: &client::ClientID,
	) -> bool
	{
		let Some((member, other_member)) = self
			.get_member(channel_id, member_id)
			.zip(self.get_member(channel_id, other_member_id))
		else {
			return false;
		};

		let Some(m_hal) = member.highest_access_level() else {
			return false;
		};
		let Some(om_hal) = other_member.highest_access_level() else {
			return m_hal.flag() >= channel::mode::ChannelAccessLevel::HalfOperator.flag();
		};

		match m_hal {
			| channel::mode::ChannelAccessLevel::Owner => true,
			| channel::mode::ChannelAccessLevel::AdminOperator => {
				match om_hal {
					| channel::mode::ChannelAccessLevel::Owner
					| channel::mode::ChannelAccessLevel::AdminOperator => false,
					| _ => true,
				}
			}
			| channel::mode::ChannelAccessLevel::Operator => {
				match om_hal {
					| channel::mode::ChannelAccessLevel::Owner
					| channel::mode::ChannelAccessLevel::AdminOperator => false,
					| _ => true,
				}
			}
			| channel::mode::ChannelAccessLevel::HalfOperator => {
				match om_hal {
					| channel::mode::ChannelAccessLevel::Vip => true,
					| _ => false,
				}
			}
			| channel::mode::ChannelAccessLevel::Vip => false,
		}
	}

	/// Supprime le niveau d'accès d'un pseudo.
	fn remove_client_access_level(
		&self,
		channel_id: &str,
		client_id: &client::ClientID,
		access_level: channel::mode::ChannelAccessLevel,
	) -> Option<channel::member::ChannelMember>
	{
		let mut channel = self.get_mut(channel_id)?;
		let channel_member = channel.member_mut(client_id)?;
		channel_member
			.remove_access_level(access_level)
			.then_some(channel_member.clone())
	}

	/// Met à jour le niveau d'accès d'un pseudo.
	fn update_client_access_level(
		&self,
		channel_id: &str,
		client_id: &client::ClientID,
		access_level: channel::mode::ChannelAccessLevel,
	) -> Option<channel::member::ChannelMember>
	{
		let mut channel = self.get_mut(channel_id)?;
		let channel_member = channel.member_mut(client_id)?;
		channel_member
			.update_access_level(access_level)
			.then_some(channel_member.clone())
	}
}
