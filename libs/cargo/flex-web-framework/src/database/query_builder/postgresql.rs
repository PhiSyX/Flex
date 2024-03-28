// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use lexa_database::SGBD;
use sqlx::postgres::PgRow;

use super::SQLQueryBuilder;
use crate::{DatabaseService, PostgreSQLDatabase};

// -------------- //
// Implémentation //
// -------------- //

// FIXME: utiliser de vraies méthodes de query builder
impl SQLQueryBuilder<DatabaseService<PostgreSQLDatabase>>
{
	pub async fn fetch_one<'a, T>(
		&'a self,
		raw_query: &'a str,
		bindings: &'a [&'a str],
	) -> Result<T, sqlx::Error>
	where
		T: for<'r> sqlx::FromRow<'r, PgRow>,
		T: Send + Unpin,
		T: std::fmt::Debug,
	{
		let mut q = sqlx::query_as(raw_query);
		for binding in bindings {
			q = q.bind(binding);
		}
		q.fetch_one(self.database.connection.pool()).await
	}

	pub async fn insert<'a, T>(
		&'a self,
		raw_query: &'a str,
		bindings: &'a [&'a str],
	) -> Result<T, sqlx::Error>
	where
		T: for<'r> sqlx::FromRow<'r, PgRow>,
		T: Send + Unpin,
		T: std::fmt::Debug,
	{
		let mut q = sqlx::query_as(raw_query);
		for binding in bindings {
			q = q.bind(binding);
		}
		q.fetch_one(self.database.connection.pool()).await
	}
}
