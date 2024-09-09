// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::sync::Arc;

use flex_chat::channel::{
	AccessControlMask,
	ChannelAccessLevel,
	SettingsFlag,
	CHANNEL_MODE_LIST_BAN,
	CHANNEL_MODE_LIST_BAN_EXCEPT,
	CHANNEL_MODE_LIST_INVITE_EXCEPT,
};
use flex_chat::client::Socket;
use flex_chat::mode::ApplyMode;
use flex_web_framework::WebSocketHandler;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::mode::{
	ChannelModeCommandFormData,
	ModeAccessControlClientSocketCommandResponseInterface,
	ModeChannelAccessControlApplicationInterface,
	ModeChannelAccessLevelApplicationInterface,
	ModeChannelSettingsApplicationInterface,
	ModeChannelSettingsClientSocketCommandResponseInterface,
};
use crate::features::chat::oper::OperApplicationInterface;
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct ModeChannelSettingsHandler;

// -------------- //
// Implémentation //
// -------------- //

impl WebSocketHandler for ModeChannelSettingsHandler
{
	type App = ChatApplication;
	type Data = ChannelModeCommandFormData;

	const EVENT_NAME: &'static str = "MODE";

	fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<ChannelModeCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		let mut added_list: Vec<(char, ApplyMode<_>)> = vec![];
		let mut removed_list: Vec<(char, ApplyMode<_>)> = vec![];

		let mut added_settings: Vec<ApplyMode<_>> = vec![];
		let mut removed_settings: Vec<ApplyMode<_>> = vec![];

		// NOTE: les opérateurs globaux peuvent appliquer n'importe quels modes.
		if app.is_client_global_operator(&client_socket) {
			apply_bans(
				app,
				&client_socket,
				&data.target,
				data.modes.bans.as_deref(),
				&mut added_list,
				&mut removed_list,
			);
			apply_bans_except(
				app,
				&client_socket,
				&data.target,
				data.modes.bans_except.as_deref(),
				&mut added_list,
				&mut removed_list,
			);
			apply_invites_except(
				app,
				&client_socket,
				&data.target,
				data.modes.invites_except.as_deref(),
				&mut added_list,
				&mut removed_list,
			);
			if let Some(limit) = data.modes.limit {
				apply_limit_members(
					app,
					&client_socket,
					&data.target,
					data.modes.limit,
					SettingsFlag::Limit(limit),
					&mut added_settings,
					&mut removed_settings,
				);
			}
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.invite_only,
				SettingsFlag::InviteOnly,
				&mut added_settings,
				&mut removed_settings,
			);
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.moderate,
				SettingsFlag::Moderate,
				&mut added_settings,
				&mut removed_settings,
			);
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.no_external_messages,
				SettingsFlag::NoExternalMessages,
				&mut added_settings,
				&mut removed_settings,
			);
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.no_topic,
				SettingsFlag::NoTopic,
				&mut added_settings,
				&mut removed_settings,
			);
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.secret,
				SettingsFlag::Secret,
				&mut added_settings,
				&mut removed_settings,
			);

			if let Some(key) = data.modes.key.map(|s| s.to_string()).as_ref() {
				apply_mode_settings_str(
					app,
					&client_socket,
					&data.target,
					key,
					SettingsFlag::Key(key.to_owned()),
					&mut added_settings,
					&mut removed_settings,
				);
			}

			if !added_list.is_empty() || !removed_list.is_empty() {
				client_socket.emit_target_access_control(
					&data.target,
					&added_list,
					&removed_list,
					true,
				);
			}

			if !added_settings.is_empty() || !removed_settings.is_empty() {
				client_socket.emit_channel_settings(
					&data.target,
					&added_settings,
					&removed_settings,
				);
			}

			return;
		}

		// NOTE: seuls les membres ayant un niveau d'accès minimal à
		// [ChannelAccessLevel::HalfOperator] peuvent appliquer
		// les modes suivants:

		if !app.does_client_have_rights_on_channel(
			&client_socket,
			&data.target,
			ChannelAccessLevel::HalfOperator,
		) {
			return;
		}

		apply_bans(
			app,
			&client_socket,
			&data.target,
			data.modes.bans.as_deref(),
			&mut added_list,
			&mut removed_list,
		);
		apply_bans_except(
			app,
			&client_socket,
			&data.target,
			data.modes.bans_except.as_deref(),
			&mut added_list,
			&mut removed_list,
		);
		apply_invites_except(
			app,
			&client_socket,
			&data.target,
			data.modes.invites_except.as_deref(),
			&mut added_list,
			&mut removed_list,
		);
		if let Some(limit) = data.modes.limit {
			apply_limit_members(
				app,
				&client_socket,
				&data.target,
				data.modes.limit,
				SettingsFlag::Limit(limit),
				&mut added_settings,
				&mut removed_settings,
			);
		}
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.invite_only,
			SettingsFlag::InviteOnly,
			&mut added_settings,
			&mut removed_settings,
		);
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.moderate,
			SettingsFlag::Moderate,
			&mut added_settings,
			&mut removed_settings,
		);
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.no_external_messages,
			SettingsFlag::NoExternalMessages,
			&mut added_settings,
			&mut removed_settings,
		);
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.no_topic,
			SettingsFlag::NoTopic,
			&mut added_settings,
			&mut removed_settings,
		);
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.secret,
			SettingsFlag::Secret,
			&mut added_settings,
			&mut removed_settings,
		);

		if let Some(key) = data.modes.key.map(|s| s.to_string()).as_ref() {
			apply_mode_settings_str(
				app,
				&client_socket,
				&data.target,
				key,
				SettingsFlag::Key(key.to_owned()),
				&mut added_settings,
				&mut removed_settings,
			);
		}

		if !added_list.is_empty() || !removed_list.is_empty() {
			client_socket.emit_target_access_control(
				&data.target,
				&added_list,
				&removed_list,
				true,
			);
		}

		if !added_settings.is_empty() || !removed_settings.is_empty() {
			client_socket.emit_channel_settings(
				&data.target,
				&added_settings,
				&removed_settings,
			);
		}
	}
}

fn apply_bans(
	app: &ChatApplication,
	client_socket: &Socket,
	channel_name: &str,
	bans: Option<&[Arc<str>]>,
	alist: &mut Vec<(char, ApplyMode<AccessControlMask>)>,
	rlist: &mut Vec<(char, ApplyMode<AccessControlMask>)>,
)
{
	let bans = bans.unwrap_or_default();

	for banmask in bans {
		if app.has_banmask_on_channel(client_socket, channel_name, banmask) {
			rlist.extend(
				app.apply_unban_on_channel(
					client_socket,
					channel_name,
					banmask,
				)
				.map(|mode| (CHANNEL_MODE_LIST_BAN, mode)),
			);
		} else {
			alist.extend(
				app.apply_ban_on_channel(client_socket, channel_name, banmask)
					.map(|mode| (CHANNEL_MODE_LIST_BAN, mode)),
			);
		}
	}
}

fn apply_bans_except(
	app: &ChatApplication,
	client_socket: &Socket,
	channel_name: &str,
	bans_except: Option<&[Arc<str>]>,
	alist: &mut Vec<(char, ApplyMode<AccessControlMask>)>,
	rlist: &mut Vec<(char, ApplyMode<AccessControlMask>)>,
)
{
	let bans_except = bans_except.unwrap_or_default();

	for banmask in bans_except {
		if app.has_banmask_except_on_channel(
			client_socket,
			channel_name,
			banmask,
		) {
			rlist.extend(
				app.apply_unban_except_on_channel(
					client_socket,
					channel_name,
					banmask,
				)
				.map(|mode| (CHANNEL_MODE_LIST_BAN_EXCEPT, mode)),
			);
		} else {
			alist.extend(
				app.apply_ban_except_on_channel(
					client_socket,
					channel_name,
					banmask,
				)
				.map(|mode| (CHANNEL_MODE_LIST_BAN_EXCEPT, mode)),
			);
		}
	}
}

fn apply_invites_except(
	app: &ChatApplication,
	client_socket: &Socket,
	channel_name: &str,
	invites_except: Option<&[Arc<str>]>,
	alist: &mut Vec<(char, ApplyMode<AccessControlMask>)>,
	rlist: &mut Vec<(char, ApplyMode<AccessControlMask>)>,
)
{
	let invites_except = invites_except.unwrap_or_default();

	for invitemask in invites_except {
		if app.has_invitemask_except_on_channel(
			client_socket,
			channel_name,
			invitemask,
		) {
			rlist.extend(
				app.apply_uninvite_except_on_channel(
					client_socket,
					channel_name,
					invitemask,
				)
				.map(|mode| (CHANNEL_MODE_LIST_INVITE_EXCEPT, mode)),
			);
		} else {
			alist.extend(
				app.apply_invite_except_on_channel(
					client_socket,
					channel_name,
					invitemask,
				)
				.map(|mode| (CHANNEL_MODE_LIST_INVITE_EXCEPT, mode)),
			);
		}
	}
}

fn apply_mode_settings_bool(
	app: &ChatApplication,
	client_socket: &Socket,
	channel_name: &str,
	maybe_bool: Option<bool>,
	flag: SettingsFlag,
	alist: &mut Vec<ApplyMode<SettingsFlag>>,
	rlist: &mut Vec<ApplyMode<SettingsFlag>>,
)
{
	if let Some(b) = maybe_bool {
		if b {
			alist.extend(app.set_settings_on_channel(
				client_socket,
				channel_name,
				flag,
			));
		} else {
			rlist.extend(app.unset_settings_on_channel(
				client_socket,
				channel_name,
				flag,
			));
		}
	}
}

fn apply_mode_settings_str(
	app: &ChatApplication,
	client_socket: &Socket,
	channel_name: &str,
	s: &str,
	flag: SettingsFlag,
	alist: &mut Vec<ApplyMode<SettingsFlag>>,
	rlist: &mut Vec<ApplyMode<SettingsFlag>>,
)
{
	if !s.is_empty() {
		alist.extend(app.set_settings_on_channel(
			client_socket,
			channel_name,
			flag,
		));
	} else {
		rlist.extend(app.unset_settings_on_channel(
			client_socket,
			channel_name,
			flag,
		));
	}
}

fn apply_limit_members(
	app: &ChatApplication,
	client_socket: &Socket,
	channel_name: &str,
	max: Option<u16>,
	flag: SettingsFlag,
	alist: &mut Vec<ApplyMode<SettingsFlag>>,
	rlist: &mut Vec<ApplyMode<SettingsFlag>>,
)
{
	if max.filter(|&m| m > 0).is_some() {
		alist.extend(app.set_settings_on_channel(
			client_socket,
			channel_name,
			flag,
		));
	} else {
		rlist.extend(app.unset_settings_on_channel(
			client_socket,
			channel_name,
			flag,
		));
	}
}
