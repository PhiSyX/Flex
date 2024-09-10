// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::json_rpc::routing::{
	JsonRpcHandler,
	JsonRpcHandlerCollection,
	JsonRpcHandlersInterface,
	JsonRpcRouter,
	JsonRpcRouterBuilder,
};
use flex_web_framework::AxumState;

use crate::features::hello_world::handlers::HelloWorldRpcHandler;
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct HelloWorldRpcRouter;

// -------------- //
// Implémentation //
// -------------- //

impl JsonRpcHandlersInterface<FlexState> for HelloWorldRpcRouter
{
	fn handlers(_: &AxumState<FlexState>)
		-> JsonRpcHandlerCollection<FlexState>
	{
		Self::collection().add(JsonRpcRouter::name(
			HelloWorldRpcHandler::RPC_COMMAND_NAME,
			HelloWorldRpcHandler::handle.into_dyn(),
		))
	}
}
