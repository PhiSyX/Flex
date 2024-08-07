// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{
	AccessControlMask,
	Channel,
	ChannelAccessControlBanInterface,
	ChannelAccessControlBanExceptInterface,
	ChannelAccessControlInviteExceptInterface,
	ChannelAccessLevel,
	ChannelInterface,
	ChannelMember,
	ChannelsSessionInterface,
	SettingsFlag,
};
use flex_chat::client::channel::responses::ChannelClientSocketErrorReplies;
use flex_chat::client::{ClientSocketInterface, Socket};
use flex_chat::mode::{ApplyMode, Mask};
use flex_chat::user::UserInterface;

use super::ModeChannelAccessLevelChannelsSessionInterface;
use crate::features::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait ModeChannelAccessControlApplicationInterface
{
	type Channel: ChannelInterface;
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Applique un ban sur un salon.
	fn apply_ban_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;

	/// Applique une exception de ban sur un salon.
	fn apply_ban_except_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;
	
	/// Applique une exception d'invite sur un salon.
	fn apply_invite_except_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;

	/// Retire un ban sur un salon.
	fn apply_unban_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;

	/// Retire une exception de ban sur un salon.
	fn apply_unban_except_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;

	/// Retire une exception d'invite sur un salon.
	fn apply_uninvite_except_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>;

	/// Est-qu'un adresse mask d'un ban existe dans la liste des bannissement
	/// d'un salon.
	fn has_banmask_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> bool;

	/// Est-qu'un adresse mask d'une exception de ban existe dans la liste des
	/// exceptions des bannissement d'un salon.
	fn has_banmask_except_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> bool;

	/// Est-qu'un adresse mask d'une exception d'invite existe dans la liste des
	/// exceptions des modes d'invitation d'un salon.
	fn has_invitemask_except_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> bool;
}

pub trait ModeChannelAccessLevelApplicationInterface
{
	type Channel: ChannelInterface;
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Est-ce que le client courant a le droit demandé sur le salon.
	fn does_client_have_rights_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		min_access_level: ChannelAccessLevel,
	) -> bool;

	/// Met à jour les niveaux d'accès d'un client sur un salon.
	fn update_member_access_level_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		set_access_level: ChannelAccessLevel,
	) -> Option<ChannelMember>;

	/// Supprime un niveau d'accès pour un pseudo d'un salon.
	fn remove_member_access_level_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		unset_access_level: ChannelAccessLevel,
	) -> Option<ChannelMember>;
}

pub trait ModeChannelSettingsApplicationInterface
{
	type Channel: ChannelInterface;
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Définit un nouveau mode de salon.
	fn set_settings_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		flag: SettingsFlag,
	) -> Option<ApplyMode<SettingsFlag>>;

	/// Retire un mode de salon existant.
	fn unset_settings_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		flag: SettingsFlag,
	) -> Option<ApplyMode<SettingsFlag>>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ModeChannelAccessControlApplicationInterface for ChatApplication
{
	type Channel = Channel;
	type ClientSocket<'cs> = Socket<'cs>;

	fn apply_ban_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
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
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.add_ban_except(client_socket.user(), mask)
	}

	fn apply_invite_except_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>> {
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.add_invite_except(client_socket.user(), mask)
	}

	fn apply_unban_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
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
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.remove_ban_except(client_socket.user(), mask)
	}

	fn apply_uninvite_except_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>> {
		let Some(mut channel) = self.channels.get_mut(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return None;
		};
		channel.remove_invite_except(client_socket.user(), mask)
	}
	
	fn has_banmask_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
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
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
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

	fn has_invitemask_except_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		mask: impl Into<Mask>,
	) -> bool {
		let Some(channel) = self.channels.get(channel_name) else {
			client_socket.send_err_nosuchchannel(channel_name);
			return false;
		};
		let mask_r = &mask.into();
		channel.has_invitemask_except(mask_r)
	}
}

impl ModeChannelAccessLevelApplicationInterface for ChatApplication
{
	type Channel = Channel;
	type ClientSocket<'cs> = Socket<'cs>;

	fn does_client_have_rights_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
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
		client_socket: &Self::ClientSocket<'_>,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		set_access_level: ChannelAccessLevel,
	) -> Option<ChannelMember>
	{
		self.channels.update_client_access_level(
			channel,
			client_socket.cid(),
			set_access_level,
		)
	}

	fn remove_member_access_level_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
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
	type Channel = Channel;
	type ClientSocket<'cs> = Socket<'cs>;

	/// Définit un nouveau mode de salon.
	fn set_settings_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		flag: SettingsFlag,
	) -> Option<ApplyMode<SettingsFlag>>
	{
		let Some(mut channel) = self.channels.get_mut(channel) else {
			client_socket.send_err_nosuchchannel(channel);
			return None;
		};

		channel.modes_settings.set(
			ApplyMode::new(flag)
				.with_update_by(client_socket.user().nickname()),
		)
	}

	/// Retire un mode de salon existant.
	fn unset_settings_on_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		flag: SettingsFlag,
	) -> Option<ApplyMode<SettingsFlag>>
	{
		let Some(mut channel) = self.channels.get_mut(channel) else {
			client_socket.send_err_nosuchchannel(channel);
			return None;
		};
		channel.modes_settings.unset(
			ApplyMode::new(flag)
				.with_update_by(client_socket.user().nickname()),
		)
	}
}
