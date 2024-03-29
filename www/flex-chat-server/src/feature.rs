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
use socketioxide::extract::{SocketRef, State, TryData};

use super::features::*;
use super::{routes, sessions};
use crate::{config, FlexApplicationState, FlexState};

// ----- //
// Macro //
// ----- //

macro_rules! handlers {
	(
		$socket:expr,

		$( + use $struct_handler:tt ; )*
	) => {
		$(
			$socket.on(
				$struct_handler::COMMAND_NAME,
				$struct_handler::handle
			);
		)*
	};

	(
		$socket:expr,

		$( -/+ use $struct_handler:tt ; )*
	) => {
		$(
			$socket.on(
				$struct_handler::SET_COMMAND_NAME,
				$struct_handler::handle_set
			);
			$socket.on(
				$struct_handler::UNSET_COMMAND_NAME,
				$struct_handler::handle_unset
			);
		)*
	};
}

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
	type State = FlexState;

	const NAME: &'static str = "ChatApplication";

	fn register_services(
		_config: &flex_web_framework::Config<Self::Config>,
		axum_state: &mut FlexApplicationState,
		router: flex_web_framework::AxumRouter<Self::State>,
	) -> flex_web_framework::AxumRouter<Self::State>
	{
		let (layer, io) = socketioxide::SocketIo::builder()
			.max_buffer_size(1024)
			.with_state(axum_state.clone())
			.with_state(Self::default())
			.build_layer();

		io.ns(
			"/",
			|socket: SocketRef,
			 server_state: State<FlexApplicationState>,
			 state: State<ChatApplication>,
			 data: TryData<RememberUserFormData>| {
				ConnectionRegistrationHandler::handle_connect(&socket, server_state, state, data);

				handlers!( socket,
					+ use AwayHandler;
					+ use InviteHandler;
					+ use JoinHandler;
					+ use KickHandler;
					+ use KillHandler;
					+ use ListHandler;
					+ use NickHandler;
					+ use NoticeHandler;
					+ use OperHandler;
					+ use PartHandler;
					+ use PrivmsgHandler;
					+ use PubmsgHandler;
					+ use QuitHandler;
					+ use SajoinHandler;
					+ use SapartHandler;
					+ use SilenceHandler;
					+ use TopicHandler;
				);

				/* Channel Modes */
				handlers!( socket,
					+ use ModeChannelSettingsHandler;
				);
				/* Channel Access Control */
				handlers!( socket,
					-/+ use ModeChannelAccessControlBanHandler;
					-/+ use ModeChannelAccessControlBanExceptionHandler;
				);
				/* Channel Access Level */
				handlers!( socket,
					-/+ use ModeChannelAccessLevelQOPHandler;
					-/+ use ModeChannelAccessLevelAOPHandler;
					-/+ use ModeChannelAccessLevelOPHandler;
					-/+ use ModeChannelAccessLevelHOPHandler;
					-/+ use ModeChannelAccessLevelVIPHandler;
				);
			},
		);

		axum_state.set_state(FlexState { socket_io: io });

		router.layer(layer)
	}
}
