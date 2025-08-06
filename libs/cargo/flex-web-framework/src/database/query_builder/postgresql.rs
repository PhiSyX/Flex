// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::marker::PhantomData;

use flex_database::SGBD;
use sqlx::postgres::PgRow;

use super::SQLQueryBuilder;
use super::insert::SQLQueryInsertBuilder;
use super::select::SQLQuerySelectBuilder;
use super::table::SQLQueryBuilderTable;
use super::update::SQLQueryUpdateBuilder;
use crate::{DatabaseService, PostgreSQLDatabase};

// -------------- //
// Implémentation //
// -------------- //

impl SQLQueryBuilder<DatabaseService<PostgreSQLDatabase>>
{
	pub fn table<R>(
		&self,
		name: impl ToString,
	) -> SQLQueryBuilderTable<DatabaseService<PostgreSQLDatabase>, R>
	{
		SQLQueryBuilderTable {
			db: self.database.clone(),
			name: name.to_string(),
			select: Default::default(),
			insert: Default::default(),
			update: Default::default(),
			_phantom: PhantomData,
		}
	}
}

impl<R> SQLQuerySelectBuilder<DatabaseService<PostgreSQLDatabase>, R>
{
	pub async fn fetch_one(&self) -> Result<R, sqlx::Error>
	where
		R: for<'r> sqlx::FromRow<'r, PgRow>,
		R: Send + Unpin,
		R: std::fmt::Debug,
	{
		let table: SQLQueryBuilderTable<
			DatabaseService<PostgreSQLDatabase>,
			R,
		> = SQLQueryBuilderTable {
			db: self.db.clone(),
			name: self.table.to_owned(),
			select: Some(SQLQuerySelectBuilder {
				table: self.table.clone(),
				db: self.db.clone(),
				fields: self.fields.clone(),
				wheres: self.wheres.clone(),
				_phantom: self._phantom,
			}),
			insert: None,
			update: None,
			_phantom: Default::default(),
		};

		let sql = table.build();

		let mut q = sqlx::query_as(&sql);

		for wh3re in self.wheres.iter() {
			for binding in wh3re.values() {
				q = q.bind(binding);
			}
		}

		q.fetch_one(table.db.connection.pool()).await
	}
}

impl<R> SQLQueryInsertBuilder<DatabaseService<PostgreSQLDatabase>, R>
{
	pub async fn execute(&self) -> Result<R, sqlx::Error>
	where
		R: for<'r> sqlx::FromRow<'r, PgRow>,
		R: Send + Unpin,
		R: std::fmt::Debug,
	{
		let table: SQLQueryBuilderTable<
			DatabaseService<PostgreSQLDatabase>,
			R,
		> = SQLQueryBuilderTable {
			db: self.db.clone(),
			name: self.table.to_owned(),
			select: None,
			insert: Some(SQLQueryInsertBuilder {
				table: self.table.clone(),
				db: self.db.clone(),
				props: self.props.clone(),
				wheres: self.wheres.clone(),
				returning: self.returning.clone(),
				_phantom: self._phantom,
			}),
			update: None,
			_phantom: Default::default(),
		};

		let mut sql = table.build();

		if !self.returning.is_empty() {
			sql += " RETURNING ";
			sql = format!("{sql}{}", self.returning.join(","));
		}

		let mut q = sqlx::query_as(&sql);

		for binding in self.props.values() {
			if !binding.ends_with("()") {
				q = q.bind(binding);
			}
		}

		for wh3re in self.wheres.iter() {
			for binding in wh3re.values() {
				q = q.bind(binding);
			}
		}

		q.fetch_one(table.db.connection.pool()).await
	}
}

impl<R> SQLQueryUpdateBuilder<DatabaseService<PostgreSQLDatabase>, R>
{
	pub async fn execute(&self) -> Result<R, sqlx::Error>
	where
		R: for<'r> sqlx::FromRow<'r, PgRow>,
		R: Send + Unpin,
		R: std::fmt::Debug,
	{
		let table: SQLQueryBuilderTable<
			DatabaseService<PostgreSQLDatabase>,
			R,
		> = SQLQueryBuilderTable {
			db: self.db.clone(),
			name: self.table.to_owned(),
			select: None,
			insert: None,
			update: Some(SQLQueryUpdateBuilder {
				table: self.table.clone(),
				db: self.db.clone(),
				props: self.props.clone(),
				wheres: self.wheres.clone(),
				returning: self.returning.clone(),
				_phantom: self._phantom,
			}),
			_phantom: Default::default(),
		};

		let mut sql = table.build();

		if !self.returning.is_empty() {
			sql = format!("{sql} RETURNING {}", self.returning.join(","));
		}

		let mut q = sqlx::query_as(&sql);

		for maybe_binding in self.props.values() {
			if let Some(binding) = maybe_binding {
				if !binding.ends_with("()") {
					q = q.bind(binding);
				}
			} else {
				q = q.bind(None as Option<&str>);
			}
		}

		for wh3re in self.wheres.iter() {
			for binding in wh3re.values() {
				q = q.bind(binding);
			}
		}

		q.fetch_one(table.db.connection.pool()).await
	}
}
