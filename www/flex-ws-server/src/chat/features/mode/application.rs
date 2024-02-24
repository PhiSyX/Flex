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
	AccessControlMask,
	ChannelAccessControlInterface,
	ChannelAccessLevel,
	ChannelMember,
	ChannelNameSRef,
	ChannelsSessionInterface,
	Mask,
	SettingsFlag,
};
use flex_chat_client::{ClientSocketInterface, Socket};
use flex_chat_client_channel::ChannelClientSocketErrorReplies;
use flex_chat_mode::ApplyMode;
use flex_chat_user::UserInterface;

use super::ModeChannelAccessLevelChannelsSessionInterface;
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait ModeChannelAccessControlApplicationInterface
{
	/// Applique un ban sur un salon.
	fn apply_ban_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;

	/// Applique une exception de ban sur un salon.
	fn apply_ban_except_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;

	/// Retire un ban sur un salon.
	fn apply_unban_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;

	/// Retire une exception de ban sur un salon.
	fn apply_unban_except_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;

	/// Est-qu'un adresse mask d'un ban existe dans la liste des bannissement
	/// d'un salon.
	fn has_banmask_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> bool;

	/// Est-qu'un adresse mask d'une exception de ban existe dans la liste des
	/// exceptions des bannissement d'un salon.
	fn has_banmask_except_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> bool;
}

pub trait ModeChannelAccessLevelApplicationInterface
{
	/// Est-ce que le client courant a le droit demandé sur le salon.
	fn does_client_have_rights_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		min_access_level: ChannelAccessLevel,
	) -> bool;

	/// Met à jour les niveaux d'accès d'un client sur un salon.
	fn update_member_access_level_on_channel(
		&self,
		client_socket: &Socket,
		channel: ChannelNameSRef,
		set_access_level: ChannelAccessLevel,
	) -> Option<ChannelMember>;

	/// Supprime un niveau d'accès pour un pseudo d'un salon.
	fn remove_member_access_level_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		unset_access_level: ChannelAccessLevel,
	) -> Option<ChannelMember>;
}

pub trait ModeChannelSettingsApplicationInterface
{
	/// Définit un nouveau mode de salon.
	fn set_settings_on_channel(
		&self,
		client_socket: &Socket,
		channel: ChannelNameSRef,
		flag: SettingsFlag,
	) -> Option<ApplyMode<SettingsFlag>>;

	/// Retire un mode de salon existant.
	fn unset_settings_on_channel(
		&self,
		client_socket: &Socket,
		channel: ChannelNameSRef,
		flag: SettingsFlag,
	) -> Option<ApplyMode<SettingsFlag>>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ModeChannelAccessControlApplicationInterface for ChatApplication
{
	fn apply_ban_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.add_ban(client_socket.user(), mask)
	}

	fn apply_ban_except_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.add_ban_except(client_socket.user(), mask)
	}

	fn apply_unban_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.remove_ban(client_socket.user(), mask)
	}

	fn apply_unban_except_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.remove_ban_except(client_socket.user(), mask)
	}

	fn has_banmask_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> bool
	{
		let Some(channel) = self.channels.get(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return false;
		};
		let mask_r = &mask.into();
		channel.has_banmask(mask_r)
	}

	fn has_banmask_except_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		mask: impl Into<Mask>,
	) -> bool
	{
		let Some(channel) = self.channels.get(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return false;
		};
		let mask_r = &mask.into();
		channel.has_banmask_except(mask_r)
	}
}

impl ModeChannelAccessLevelApplicationInterface for ChatApplication
{
	fn does_client_have_rights_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		min_access_level: ChannelAccessLevel,
	) -> bool
	{
		let is_ok = self.channels.does_member_have_rights(
			channel_name,
			client_socket.cid(),
			min_access_level,
		);
		if !is_ok {
			client_socket.send_err_chanoprivsneeded(channel_name);
		}
		is_ok
	}

	fn update_member_access_level_on_channel(
		&self,
		client_socket: &Socket,
		channel: ChannelNameSRef,
		set_access_level: ChannelAccessLevel,
	) -> Option<ChannelMember>
	{
		self.channels
			.update_client_access_level(channel, client_socket.cid(), set_access_level)
	}

	fn remove_member_access_level_on_channel(
		&self,
		client_socket: &Socket,
		channel_name: ChannelNameSRef,
		unset_access_level: ChannelAccessLevel,
	) -> Option<ChannelMember>
	{
		self.channels.remove_client_access_level(
			channel_name,
			client_socket.cid(),
			unset_access_level,
		)
	}
}

impl ModeChannelSettingsApplicationInterface for ChatApplication
{
	/// Définit un nouveau mode de salon.
	fn set_settings_on_channel(
		&self,
		client_socket: &Socket,
		channel: ChannelNameSRef,
		flag: SettingsFlag,
	) -> Option<ApplyMode<SettingsFlag>>
	{
		let Some(mut channel) = self.channels.get_mut(channel) else {
			client_socket.send_err_nosuchchannel(channel);
			return None;
		};

		channel
			.modes_settings
			.set(ApplyMode::new(flag).with_update_by(client_socket.user().nickname()))
	}

	/// Retire un mode de salon existant.
	fn unset_settings_on_channel(
		&self,
		client_socket: &Socket,
		channel: ChannelNameSRef,
		flag: SettingsFlag,
	) -> Option<ApplyMode<SettingsFlag>>
	{
		let Some(mut channel) = self.channels.get_mut(channel) else {
			client_socket.send_err_nosuchchannel(channel);
			return None;
		};
		channel
			.modes_settings
			.unset(ApplyMode::new(flag).with_update_by(client_socket.user().nickname()))
	}
}
