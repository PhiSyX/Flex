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
	ChannelModeCommandFormData,
	ModeChannelSettingsApplicationInterface,
	ModeChannelSettingsClientSocketCommandResponseInterface,
};
use crate::src::chat::components::channel;
use crate::src::chat::features::{
	ApplyMode,
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

		let mut added: Vec<ApplyMode<_>> = vec![];
		let mut removed: Vec<ApplyMode<_>> = vec![];

		// NOTE: les opérateurs globaux peuvent appliquer n'importe quels modes.
		if app.is_client_global_operator(&client_socket) {
			if let Some(b) = data.modes.invite_only {
				if b {
					added.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::InviteOnly,
					));
				} else {
					removed.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::InviteOnly,
					));
				}
			}

			if let Some(key) = data.modes.key.as_ref() {
				if key.is_empty() {
					removed.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Key(key.to_owned()),
					));
				} else {
					added.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Key(key.to_owned()),
					));
				}
			}

			if let Some(b) = data.modes.moderate {
				if b {
					added.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Moderate,
					));
				} else {
					removed.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Moderate,
					));
				}
			}

			if let Some(b) = data.modes.no_external_messages {
				if b {
					added.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::NoExternalMessages,
					));
				} else {
					removed.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::NoExternalMessages,
					));
				}
			}

			if let Some(b) = data.modes.no_topic {
				if b {
					added.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::NoTopic,
					));
				} else {
					removed.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::NoTopic,
					));
				}
			}

			if let Some(b) = data.modes.oper_only {
				if b {
					added.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::OperOnly,
					));
				} else {
					removed.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::OperOnly,
					));
				}
			}

			if let Some(b) = data.modes.secret {
				if b {
					added.extend(app.set_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Secret,
					));
				} else {
					removed.extend(app.unset_settings_on_channel(
						&client_socket,
						&data.target,
						channel::mode::SettingsFlags::Secret,
					));
				}
			}

			client_socket.emit_channel_settings(&data.target, &added, &removed);

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

		if let Some(b) = data.modes.invite_only {
			if b {
				added.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::InviteOnly,
				));
			} else {
				removed.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::InviteOnly,
				));
			}
		}

		if let Some(key) = data.modes.key.as_ref() {
			if key.is_empty() {
				removed.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Key(key.to_owned()),
				));
			} else {
				added.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Key(key.to_owned()),
				));
			}
		}

		if let Some(b) = data.modes.moderate {
			if b {
				added.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Moderate,
				));
			} else {
				removed.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Moderate,
				));
			}
		}

		if let Some(b) = data.modes.no_external_messages {
			if b {
				added.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::NoExternalMessages,
				));
			} else {
				removed.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::NoExternalMessages,
				));
			}
		}

		if let Some(b) = data.modes.no_topic {
			if b {
				added.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::NoTopic,
				));
			} else {
				removed.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::NoTopic,
				));
			}
		}

		if let Some(b) = data.modes.secret {
			if b {
				added.extend(app.set_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Secret,
				));
			} else {
				removed.extend(app.unset_settings_on_channel(
					&client_socket,
					&data.target,
					channel::mode::SettingsFlags::Secret,
				));
			}
		}

		client_socket.emit_channel_settings(&data.target, &added, &removed);
	}
}
