// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::{Feature, WebSocketFeature};
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
	type Handlers = (
		AwayHandler,
		InviteHandler,
		JoinHandler,
		KickHandler,
		KillHandler,
		ListHandler,
		NickHandler,
		NoticeHandler,
		OperHandler,
		PartHandler,
		PrivmsgHandler,
		PubmsgHandler,
		QuitHandler,
		SajoinHandler,
		SapartHandler,
		SilenceHandler,
		TopicHandler,
		/* Channel Modes */
		ModeChannelSettingsHandler,
		/* Auth */
		AuthIdentifyHandler,
	);
	type Handlers2 = (
		/* Channel Access Control */
		ModeChannelAccessControlBanHandler,
		ModeChannelAccessControlBanExceptionHandler,
		ModeChannelAccessControlInviteExceptionHandler,
		/* Channel Access Level */
		ModeChannelAccessLevelQOPHandler,
		ModeChannelAccessLevelAOPHandler,
		ModeChannelAccessLevelOPHandler,
		ModeChannelAccessLevelHOPHandler,
		ModeChannelAccessLevelVIPHandler,
	);
	type State = Self;

	const ENDPOINT: &'static str = "/chat:ws";

	fn on_connect(
		socket: SocketRef,
		server_state: State<FlexApplicationState>,
		user_state: State<<Self as WebSocketFeature<FlexState>>::State>,
		auth_data: TryData<Self::Auth>,
	)
	{
		ConnectionRegistrationHandler::handle_connect(
			&socket,
			server_state,
			user_state,
			auth_data,
		);
	}
}
