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
	ChannelAccessLevel,
	ChannelInterface,
	ChannelMemberInterface,
	ChannelsSessionInterface,
	MemberInterface,
};

use crate::src::chat::sessions::ChannelsSession;

// --------- //
// Interface //
// --------- //

pub trait ModeChannelAccessLevelChannelsSessionInterface: ChannelsSessionInterface
{
	/// Est-ce qu'un membre à des droits minimal.
	fn does_member_have_rights(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
		min_access_level: <<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::AccessLevel,
	) -> bool;

	/// Un membre PEUT-il effectuer des tâches sur un autre membre?
	fn does_member_have_rights_to_operate_on_another_member(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
		other_member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
	) -> bool;

	/// Supprime le niveau d'accès d'un pseudo.
	fn remove_client_access_level(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
		access_level: <<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::AccessLevel,
	) -> Option<<Self::Channel as ChannelMemberInterface>::Member>;

	/// Met à jour le niveau d'accès d'un pseudo.
	fn update_client_access_level(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
		access_level: <<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::AccessLevel,
	) -> Option<<Self::Channel as ChannelMemberInterface>::Member>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ModeChannelAccessLevelChannelsSessionInterface for ChannelsSession
{
	fn does_member_have_rights(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
		min_access_level: <<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::AccessLevel,
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
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
		other_member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
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
			return m_hal.flag() >= ChannelAccessLevel::HalfOperator.flag();
		};

		match m_hal {
			| ChannelAccessLevel::Owner => true,
			| ChannelAccessLevel::AdminOperator => {
				match om_hal {
					| ChannelAccessLevel::Owner | ChannelAccessLevel::AdminOperator => false,
					| _ => true,
				}
			}
			| ChannelAccessLevel::Operator => {
				match om_hal {
					| ChannelAccessLevel::Owner | ChannelAccessLevel::AdminOperator => false,
					| _ => true,
				}
			}
			| ChannelAccessLevel::HalfOperator => {
				match om_hal {
					| ChannelAccessLevel::Vip => true,
					| _ => false,
				}
			}
			| ChannelAccessLevel::Vip => false,
		}
	}

	/// Supprime le niveau d'accès d'un pseudo.
	fn remove_client_access_level(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
		access_level: <<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::AccessLevel,
	) -> Option<<Self::Channel as ChannelMemberInterface>::Member>
	{
		let mut channel = self.get_mut(channel_id)?;
		let channel_member = channel.member_mut(member_id)?;
		channel_member
			.remove_access_level(access_level)
			.then_some(channel_member.clone())
	}

	/// Met à jour le niveau d'accès d'un pseudo.
	fn update_client_access_level(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
		access_level: <<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::AccessLevel,
	) -> Option<<Self::Channel as ChannelMemberInterface>::Member>
	{
		let mut channel = self.get_mut(channel_id)?;
		let channel_member = channel.member_mut(member_id)?;
		channel_member
			.update_access_level(access_level)
			.then_some(channel_member.clone())
	}
}
