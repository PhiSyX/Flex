// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use rpc_router::FromResources;

use crate::http::{HttpAuthContext, HttpContext};
use crate::query_builder::SQLQueryBuilder;
use crate::{DatabaseService, PostgreSQLDatabase};

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<T> FromResources for HttpContext<T> {}
impl<T, U> FromResources for HttpAuthContext<T, U> {}

impl FromResources for SQLQueryBuilder<DatabaseService<PostgreSQLDatabase>>
{
	fn from_resources(
		resources: &rpc_router::Resources,
	) -> rpc_router::FromResourcesResult<Self>
	where
		Self: Sized + Clone + Send + Sync + 'static,
	{
		resources
			.get::<Option<Self>>()
			.and_then(|maybe_query_builder| maybe_query_builder)
			.ok_or_else(
				rpc_router::FromResourcesError::resource_not_found::<Self>,
			)
	}
}
