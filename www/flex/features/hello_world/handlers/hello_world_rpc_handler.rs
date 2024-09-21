// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::http::HttpContext;
use flex_web_framework::json_rpc::JsonRpcHandler;
use flex_web_framework::json_rpc::JsonRpcResult;
use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase};

use crate::features::users::dto::UserSessionDTO;
use crate::features::users::sessions::constant::USER_SESSION;

// --------- //
// Structure //
// --------- //

pub struct HelloWorldRpcHandler;

#[derive(Clone)]
#[derive(Debug)]
#[derive(serde::Serialize, serde::Deserialize)]
#[derive(flex_web_framework::json_rpc::JsonRpcParams)]
pub struct Params
{
	string: String,
	number: usize,
	#[serde(skip_deserializing, skip_serializing_if = "Option::is_none")]
	user: Option<UserSessionDTO>,
}

// -------------- //
// Implémentation //
// -------------- //

impl HelloWorldRpcHandler
{
	pub const RPC_COMMAND_NAME: &str = "hello_world";

	pub async fn handle(
		ctx: HttpContext<JsonRpcHandler>,
		query_builder: SQLQueryBuilder<DatabaseService<PostgreSQLDatabase>>,
		mut params: Params,
	) -> JsonRpcResult<Params>
	{
		if let Ok(user_session) =
			ctx.session.get::<UserSessionDTO>(USER_SESSION).await
		{
			params.user = user_session;
		}

		println!("RPC CALL: HelloWorldRpcHandler with params: {params:?}");

		Ok(params)
	}
}
