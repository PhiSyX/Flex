// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use socketioxide::extract::{Data, SocketRef, State};

use super::{
	ModeAccessControlClientSocketCommandResponseInterface,
	ModeChannelSettingsApplicationInterface,
	ModeChannelSettingsClientSocketCommandResponseInterface,
};
use crate::src::chat::components::channel;
use crate::src::chat::components::channel::mode::AccessControlMode;
use crate::src::chat::features::{
	ApplyMode,
	ChannelModeCommandFormData,
	ModeChannelAccessControlApplicationInterface,
	ModeChannelAccessLevelApplicationInterface,
	OperApplicationInterface,
};
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct ModeChannelSettingsHandler;

// -------------- //
// Implémentation //
// -------------- //

impl ModeChannelSettingsHandler
{
	pub const COMMAND_NAME: &'static str = "MODE";

	pub fn handle(
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
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.invite_only,
				channel::mode::SettingsFlags::InviteOnly,
				&mut added_settings,
				&mut removed_settings,
			);
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.moderate,
				channel::mode::SettingsFlags::Moderate,
				&mut added_settings,
				&mut removed_settings,
			);
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.no_external_messages,
				channel::mode::SettingsFlags::NoExternalMessages,
				&mut added_settings,
				&mut removed_settings,
			);
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.no_topic,
				channel::mode::SettingsFlags::NoTopic,
				&mut added_settings,
				&mut removed_settings,
			);
			apply_mode_settings_bool(
				app,
				&client_socket,
				&data.target,
				data.modes.secret,
				channel::mode::SettingsFlags::Secret,
				&mut added_settings,
				&mut removed_settings,
			);

			if let Some(key) = data.modes.key.as_deref() {
				apply_mode_settings_str(
					app,
					&client_socket,
					&data.target,
					key,
					channel::mode::SettingsFlags::Key(key.into()),
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
		// channel::mode::ChannelAccessLevel::HalfOperator peuvent appliquer
		// les modes suivants:

		if !app.does_client_have_rights_on_channel(
			&client_socket,
			&data.target,
			channel::mode::ChannelAccessLevel::HalfOperator,
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
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.invite_only,
			channel::mode::SettingsFlags::InviteOnly,
			&mut added_settings,
			&mut removed_settings,
		);
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.moderate,
			channel::mode::SettingsFlags::Moderate,
			&mut added_settings,
			&mut removed_settings,
		);
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.no_external_messages,
			channel::mode::SettingsFlags::NoExternalMessages,
			&mut added_settings,
			&mut removed_settings,
		);
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.no_topic,
			channel::mode::SettingsFlags::NoTopic,
			&mut added_settings,
			&mut removed_settings,
		);
		apply_mode_settings_bool(
			app,
			&client_socket,
			&data.target,
			data.modes.secret,
			channel::mode::SettingsFlags::Secret,
			&mut added_settings,
			&mut removed_settings,
		);

		if let Some(key) = data.modes.key.as_deref() {
			apply_mode_settings_str(
				app,
				&client_socket,
				&data.target,
				key,
				channel::mode::SettingsFlags::Key(key.into()),
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
			client_socket.emit_channel_settings(&data.target, &added_settings, &removed_settings);
		}
	}
}

fn apply_bans(
	app: &ChatApplication,
	client_socket: &crate::src::chat::components::client::Socket,
	channel: &str,
	bans: Option<&[String]>,
	alist: &mut Vec<(char, ApplyMode<AccessControlMode>)>,
	rlist: &mut Vec<(char, ApplyMode<AccessControlMode>)>,
)
{
	let bans = bans.unwrap_or_default();

	for banmask in bans {
		if app.has_banmask_on_channel(client_socket, channel, banmask) {
			rlist.extend(
				app.apply_unban_on_channel(client_socket, channel, banmask)
					.map(|mode| ('b', mode)),
			);
		} else {
			alist.extend(
				app.apply_ban_on_channel(client_socket, channel, banmask)
					.map(|mode| ('b', mode)),
			);
		}
	}
}

fn apply_mode_settings_bool(
	app: &ChatApplication,
	client_socket: &crate::src::chat::components::client::Socket,
	channel: &str,
	maybe_bool: Option<bool>,
	flag: channel::mode::SettingsFlags,
	alist: &mut Vec<ApplyMode<channel::mode::SettingsFlags>>,
	rlist: &mut Vec<ApplyMode<channel::mode::SettingsFlags>>,
)
{
	if let Some(b) = maybe_bool {
		if b {
			alist.extend(app.set_settings_on_channel(client_socket, channel, flag));
		} else {
			rlist.extend(app.unset_settings_on_channel(client_socket, channel, flag));
		}
	}
}

fn apply_mode_settings_str(
	app: &ChatApplication,
	client_socket: &crate::src::chat::components::client::Socket,
	channel: &str,
	s: &str,
	flag: channel::mode::SettingsFlags,
	alist: &mut Vec<ApplyMode<channel::mode::SettingsFlags>>,
	rlist: &mut Vec<ApplyMode<channel::mode::SettingsFlags>>,
)
{
	if !s.is_empty() {
		alist.extend(app.set_settings_on_channel(client_socket, channel, flag));
	} else {
		rlist.extend(app.unset_settings_on_channel(client_socket, channel, flag));
	}
}
