// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::http::request::OptionalQuery;
use flex_web_framework::http::response::Json;
use flex_web_framework::http::{Extensions, HttpContext, HttpContextInterface};
use flex_web_framework::types::uuid;

use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct UuidController {}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct UuidQueryParams
{
	#[serde(rename = "v")]
	variant: Option<UuidVariant>,
	ntimes: Option<u8>,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub enum UuidVariant
{
	Simple,
}

// -------------- //
// Implémentation //
// -------------- //

impl UuidController
{
	pub async fn uuid_v4(
		http: HttpContext<Self>,
		maybe_query: OptionalQuery<UuidQueryParams>,
	) -> Json<Vec<impl serde::Serialize>>
	{
		let mut ntimes = 1;

		if let Some(query) = maybe_query.0 {
			ntimes = query.ntimes.filter(|&n| n > 0 && n <= 25).unwrap_or(1);

			match query.variant {
				| Some(UuidVariant::Simple) => {
					let uuids = (0..ntimes)
						.map(|_| uuid::Uuid::new_v4().simple().to_string())
						.collect::<Vec<_>>();
					return http.response.json(uuids);
				}
				| _ => {}
			}
		}

		let uuids = (0..ntimes)
			.map(|_| uuid::Uuid::new_v4().to_string())
			.collect::<Vec<_>>();
		http.response.json(uuids)
	}

	pub async fn uuid_v7(
		http: HttpContext<Self>,
		maybe_query: OptionalQuery<UuidQueryParams>,
	) -> Json<Vec<impl serde::Serialize>>
	{
		let mut ntimes = 1;

		let ctx = uuid::ContextV7::new();
		let ts = uuid::Timestamp::now(ctx);

		if let Some(query) = maybe_query.0 {
			ntimes = query.ntimes.filter(|&n| n > 0 && n <= 25).unwrap_or(1);

			match query.variant {
				| Some(UuidVariant::Simple) => {
					let uuids = (0..ntimes)
						.map(|_| uuid::Uuid::new_v7(ts).simple().to_string())
						.collect::<Vec<_>>();
					return http.response.json(uuids);
				}
				| _ => {}
			}
		}

		let uuids = (0..ntimes)
			.map(|_| uuid::Uuid::new_v7(ts).to_string())
			.collect::<Vec<_>>();
		http.response.json(uuids)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for UuidController
{
	type State = FlexState;

	fn constructor(_ext: &Extensions, _: Self::State) -> Option<Self>
	{
		Some(Self {})
	}
}

unsafe impl Send for UuidController {}
unsafe impl Sync for UuidController {}
