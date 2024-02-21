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
			if let Some(bans) = data.modes.bans.as_deref() {
				for banmask in bans {
					if app.has_banmask_on_channel(&client_socket, &data.target, banmask) {
						removed_list.extend(
							app.apply_unban_on_channel(&client_socket, &data.target, banmask)
								.map(|mode| ('b', mode)),
						);
					} else {
						added_list.extend(
							app.apply_ban_on_channel(&client_socket, &data.target, banmask)
								.map(|mode| ('b', mode)),
						);
					}
				}
			}

			if let Some(b) = data.modes.invite_only {
				if b {
					added_settings.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::InviteOnly,
					));
				} else {
					removed_settings.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::InviteOnly,
					));
				}
			}

			if let Some(key) = data.modes.key.as_ref() {
				if key.is_empty() {
					removed_settings.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Key(key.to_owned()),
					));
				} else {
					added_settings.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Key(key.to_owned()),
					));
				}
			}

			if let Some(b) = data.modes.moderate {
				if b {
					added_settings.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Moderate,
					));
				} else {
					removed_settings.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Moderate,
					));
				}
			}

			if let Some(b) = data.modes.no_external_messages {
				if b {
					added_settings.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::NoExternalMessages,
					));
				} else {
					removed_settings.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::NoExternalMessages,
					));
				}
			}

			if let Some(b) = data.modes.no_topic {
				if b {
					added_settings.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::NoTopic,
					));
				} else {
					removed_settings.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::NoTopic,
					));
				}
			}

			if let Some(b) = data.modes.oper_only {
				if b {
					added_settings.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::OperOnly,
					));
				} else {
					removed_settings.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::OperOnly,
					));
				}
			}

			if let Some(b) = data.modes.secret {
				if b {
					added_settings.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Secret,
					));
				} else {
					removed_settings.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Secret,
					));
				}
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

		if let Some(bans) = data.modes.bans.as_deref() {
			for banmask in bans {
				if app.has_banmask_on_channel(&client_socket, &data.target, banmask) {
					removed_list.extend(
						app.apply_unban_on_channel(&client_socket, &data.target, banmask)
							.map(|mode| ('b', mode)),
					);
				} else {
					added_list.extend(
						app.apply_ban_on_channel(&client_socket, &data.target, banmask)
							.map(|mode| ('b', mode)),
					);
				}
			}
		}

		if let Some(b) = data.modes.invite_only {
			if b {
				added_settings.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::InviteOnly,
				));
			} else {
				removed_settings.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::InviteOnly,
				));
			}
		}

		if let Some(key) = data.modes.key.as_ref() {
			if key.is_empty() {
				removed_settings.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Key(key.to_owned()),
				));
			} else {
				added_settings.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Key(key.to_owned()),
				));
			}
		}

		if let Some(b) = data.modes.moderate {
			if b {
				added_settings.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Moderate,
				));
			} else {
				removed_settings.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Moderate,
				));
			}
		}

		if let Some(b) = data.modes.no_external_messages {
			if b {
				added_settings.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::NoExternalMessages,
				));
			} else {
				removed_settings.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::NoExternalMessages,
				));
			}
		}

		if let Some(b) = data.modes.no_topic {
			if b {
				added_settings.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::NoTopic,
				));
			} else {
				removed_settings.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::NoTopic,
				));
			}
		}

		if let Some(b) = data.modes.secret {
			if b {
				added_settings.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Secret,
				));
			} else {
				removed_settings.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Secret,
				));
			}
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
