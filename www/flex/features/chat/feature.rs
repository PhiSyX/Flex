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
use flex_web_framework::WebSocketFeature;
use socketioxide::extract::{SocketRef, State, TryData};

use crate::features::chat::auth::*;
use crate::features::chat::connect::*;
use crate::features::chat::invite::*;
use crate::features::chat::join::*;
use crate::features::chat::kick::*;
use crate::features::chat::kill::*;
use crate::features::chat::list::*;
use crate::features::chat::message::*;
use crate::features::chat::mode::*;
use crate::features::chat::nick::*;
use crate::features::chat::notice::*;
use crate::features::chat::oper::*;
use crate::features::chat::part::*;
use crate::features::chat::quit::*;
use crate::features::chat::silence::*;
use crate::features::chat::topic::*;
use crate::features::chat::user_status::*;
use crate::features::chat::{routes, sessions};
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
	type Config = config::chat::FlexChatConfig;
	type Router = routes::ChatRouter;
	type State = FlexState;

	const NAME: &'static str = "ChatApplication";
}

impl WebSocketFeature<FlexState> for ChatApplication
{
	type Auth = RememberUserFormData;

	type State = Self;

	const ENDPOINT: &'static str = "/chat";

	fn on_connect(
		socket: SocketRef,
		server_state: State<FlexApplicationState>,
		user_state: State<<Self as WebSocketFeature<FlexState>>::State>,
		auth_data: TryData<Self::Auth>,
	) {
		ConnectionRegistrationHandler::handle_connect(
			&socket,
			server_state,
			user_state,
			auth_data,
		);

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
			-/+ use ModeChannelAccessControlInviteExceptionHandler;
		);
		/* Channel Access Level */
		handlers!( socket,
			-/+ use ModeChannelAccessLevelQOPHandler;
			-/+ use ModeChannelAccessLevelAOPHandler;
			-/+ use ModeChannelAccessLevelOPHandler;
			-/+ use ModeChannelAccessLevelHOPHandler;
			-/+ use ModeChannelAccessLevelVIPHandler;
		);

		/* Auth */
		handlers!( socket,
			+ use AuthIdentifyHandler;
		);
	}
}
