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

				socket.on(JoinHandler::COMMAND_NAME, JoinHandler::handle);
				socket.on(NickHandler::COMMAND_NAME, NickHandler::handle);
				socket.on(PartHandler::COMMAND_NAME, PartHandler::handle);
				socket.on(QuitHandler::COMMAND_NAME, QuitHandler::handle);
			},
		);

		router.layer(layer)
	}
}
