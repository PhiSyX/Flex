// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::json_rpc::JsonRpcResult;

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
}

// -------------- //
// Implémentation //
// -------------- //

impl HelloWorldRpcHandler
{
	pub const RPC_COMMAND_NAME: &str = "hello_world";

	pub async fn handle(params: Params) -> JsonRpcResult<Params>
	{
		println!("RPC CALL: HelloWorldRpcHandler with params: {params:?}");
		Ok(params)
	}
}
