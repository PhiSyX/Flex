// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::sync::Arc;

use axum::extract::State;
use axum::response::IntoResponse;
use axum::Json;
use rpc_router::{resources_builder, Request};
use serde_json::{json, Value};

use crate::http::{HttpAuthContext, HttpContext, HttpContextInterface};
use crate::query_builder::SQLQueryBuilder;
use crate::{DatabaseService, PostgreSQLDatabase};

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct JsonRpcHandler;

#[derive(Debug)]
pub struct JsonRpcMetadata
{
	pub id: Option<Value>,
	pub method: String,
}

// -------------- //
// Implémentation //
// -------------- //

impl JsonRpcHandler
{
	async fn _handle(
		State(json_rpc_router): State<rpc_router::Router>,
		Json(json_rpc): Json<Value>,
		resource: impl FnOnce() -> rpc_router::Resources,
	) -> impl IntoResponse
	{
		let req = match Request::try_from(json_rpc) {
			| Ok(rpc_req) => rpc_req,
			| Err(err) => {
				let code = -32700;

				let message = match err {
					| rpc_router::RequestParsingError::VersionMissing {
						..
					} => {
						String::from(
							"The `version` member is REQUIRED. A String \
							 specifying the version of the JSON-RPC protocol. \
							 MUST be exactly \"2.0\".",
						)
					}

					| rpc_router::RequestParsingError::VersionInvalid {
						..
					} => {
						String::from(
							"The `version` member has an invalid value. It \
							 MUST be exactly \"2.0\".",
						)
					}

					| rpc_router::RequestParsingError::MethodMissing {
						..
					} => {
						String::from(
							"The `method` member is REQUIRED. It MUST be a \
							 String containing the name of the method to be \
							 invoked. Method names that begin with the word \
							 rpc followed by a period character (U+002E or \
							 ASCII 46) are reserved for rpc-internal methods \
							 and extensions and MUST NOT be used for anything \
							 else.",
						)
					}

					| rpc_router::RequestParsingError::MethodInvalidType {
						..
					} => {
						String::from(
							"The `method` member has an invalid value. It \
							 MUST be a String containing the name of the \
							 method to be invoked. Method names that begin \
							 with the word rpc followed by a period character \
							 (U+002E or ASCII 46) are reserved for \
							 rpc-internal methods and extensions and MUST NOT \
							 be used for anything else.",
						)
					}

					| rpc_router::RequestParsingError::IdMissing { .. } => {
						String::from(
							"The `id` member is required. It MUST be an \
							 identifier established by the Client that MUST \
							 contain a String, Number.",
						)
					}
					| rpc_router::RequestParsingError::Parse(err) => {
						err.to_string()
					}
				};

				return Json(json!({
					"jsonrpc": "2.0",
					"error": {
						"code": code,
						"message": message,
					},
				}))
				.into_response();
			}
		};

		let meta = JsonRpcMetadata {
			id: Some(req.id.clone()),
			method: req.method.clone(),
		};

		let output = json_rpc_router.call_with_resources(req, resource()).await;

		let response_object = output
			.map(|response| {
				Json(json!({
					"jsonrpc": "2.0",
					"result": response.value,
					"id": response.id,
				}))
			})
			.unwrap_or_else(|err| {
				let code = match &err.error {
					| rpc_router::Error::ParamsParsing(_) => -32600,
					| rpc_router::Error::ParamsMissingButRequested => -32602,
					| rpc_router::Error::MethodUnknown => -32601,
					| _ => -32603,
				};

				let message = match &err.error {
					| rpc_router::Error::ParamsParsing(_) => {
						"The JSON sent is not a valid Request object."
					}

					| rpc_router::Error::ParamsMissingButRequested => {
						"Invalid method parameter(s)."
					}

					| rpc_router::Error::MethodUnknown => {
						"The method does not exist / is not available."
					}
					| _ => "Internal JSON-RPC error.",
				};

				#[derive(serde::Serialize)]
				pub struct Data<'a>
				{
					method: &'a str,
					cause: String,
				}

				let data = match &err.error {
					| rpc_router::Error::ParamsParsing(serde_err) => {
						Some(Data {
							method: &err.method,
							cause: serde_err.to_string(),
						})
					}
					| _ => None,
				};

				Json(json!({
					"jsonrpc": "2.0",
					"error": {
						"code": code,
						"message": message,
						"data": data,
					},
					"id": err.id,
				}))
			});

		let mut out = response_object.into_response();
		out.extensions_mut().insert(Arc::new(meta));
		out.into_response()
	}

	// https://www.jsonrpc.org/specification
	pub async fn handle(
		ctx: HttpContext<Self>,
		state: State<rpc_router::Router>,
		json: Json<Value>,
	) -> impl IntoResponse
	{
		Self::_handle(state, json, || {
			let pg_query_builder = ctx
				.ext
				.get::<DatabaseService<PostgreSQLDatabase>>()
				.cloned()
				.map(SQLQueryBuilder::new);

			resources_builder![ctx, pg_query_builder].build()
		})
		.await
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for JsonRpcHandler
{
	type State = ();

	fn constructor(_: &axum::http::Extensions, _: Self::State) -> Option<Self>
	{
		Some(Self)
	}
}

unsafe impl Send for JsonRpcHandler {}
unsafe impl Sync for JsonRpcHandler {}
