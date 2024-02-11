// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::Feature;

use super::features::*;
use super::{routes, sessions};
use crate::config;

// --------- //
// Structure //
// --------- //

#[derive(Default)]
pub struct ChatApplication
{
	pub(crate) channels: sessions::ChannelsSession,
	pub(crate) clients: sessions::ClientsSession,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Feature for ChatApplication
{
	type Config = config::flex::flex_config;
	type Router = routes::ChatRouter;

	const NAME: &'static str = "ChatApplication";

	fn register_services(
		_config: &flex_web_framework::settings::Config<Self::Config>,
		_state: &flex_web_framework::AxumApplicationState,
		router: flex_web_framework::Router<flex_web_framework::AxumApplicationState>,
	) -> flex_web_framework::Router<flex_web_framework::AxumApplicationState>
	{
		let (layer, io) = socketioxide::SocketIo::builder()
			.max_buffer_size(1024)
			.with_state(Self::default())
			.build_layer();

		io.ns(
			"/",
			|socket: socketioxide::extract::SocketRef,
			 state: socketioxide::extract::State<ChatApplication>,
			 data: socketioxide::extract::TryData<RememberUserFormData>| {
				ConnectionRegistrationHandler::handle_connect(&socket, state, data);

				socket.on(AwayHandler::COMMAND_NAME, AwayHandler::handle);
				socket.on(SilenceHandler::COMMAND_NAME, SilenceHandler::handle);
				socket.on(JoinHandler::COMMAND_NAME, JoinHandler::handle);
				socket.on(ListHandler::COMMAND_NAME, ListHandler::handle);
				socket.on(KickHandler::COMMAND_NAME, KickHandler::handle);
				socket.on(KillHandler::COMMAND_NAME, KillHandler::handle);
				socket.on(NickHandler::COMMAND_NAME, NickHandler::handle);
				socket.on(PartHandler::COMMAND_NAME, PartHandler::handle);
				socket.on(PrivmsgHandler::COMMAND_NAME, PrivmsgHandler::handle);
				socket.on(PubmsgHandler::COMMAND_NAME, PubmsgHandler::handle);
				socket.on(OperHandler::COMMAND_NAME, OperHandler::handle);
				socket.on(QuitHandler::COMMAND_NAME, QuitHandler::handle);
				socket.on(SajoinHandler::COMMAND_NAME, SajoinHandler::handle);
				socket.on(SapartHandler::COMMAND_NAME, SapartHandler::handle);
				socket.on(TopicHandler::COMMAND_NAME, TopicHandler::handle);

				/* Channel Access Level */
				socket.on(
					ModeAccessLevelQOPHandler::SET_COMMAND_NAME,
					ModeAccessLevelQOPHandler::handle,
				);
				socket.on(
					ModeAccessLevelQOPHandler::UNSET_COMMAND_NAME,
					ModeAccessLevelQOPHandler::handle_remove,
				);
				socket.on(
					ModeAccessLevelAOPHandler::SET_COMMAND_NAME,
					ModeAccessLevelAOPHandler::handle,
				);
				socket.on(
					ModeAccessLevelAOPHandler::UNSET_COMMAND_NAME,
					ModeAccessLevelAOPHandler::handle_remove,
				);
				socket.on(
					ModeAccessLevelOPHandler::SET_COMMAND_NAME,
					ModeAccessLevelOPHandler::handle,
				);
				socket.on(
					ModeAccessLevelOPHandler::UNSET_COMMAND_NAME,
					ModeAccessLevelOPHandler::handle_remove,
				);
				socket.on(
					ModeAccessLevelHOPHandler::SET_COMMAND_NAME,
					ModeAccessLevelHOPHandler::handle,
				);
				socket.on(
					ModeAccessLevelHOPHandler::UNSET_COMMAND_NAME,
					ModeAccessLevelHOPHandler::handle_remove,
				);
				socket.on(
					ModeAccessLevelVIPHandler::SET_COMMAND_NAME,
					ModeAccessLevelVIPHandler::handle,
				);
				socket.on(
					ModeAccessLevelVIPHandler::UNSET_COMMAND_NAME,
					ModeAccessLevelVIPHandler::handle_remove,
				);

				/* Channel Modes */
				socket.on(
					ModeChannelSettingsHandler::COMMAND_NAME,
					ModeChannelSettingsHandler::handle,
				);
			},
		);

		router.layer(layer)
	}
}
