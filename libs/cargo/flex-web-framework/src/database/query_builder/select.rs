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

use super::wheres::{Where, WhereAnd, WhereOr};

// --------- //
// Interface //
// --------- //

pub trait SQLQuerySelectAllFields
{
	fn fields() -> Vec<&'static str>;
}

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct SQLQuerySelectBuilder<D, R>
{
	pub(crate) table: String,
	pub(crate) db: D,
	pub(crate) fields: Vec<String>,
	pub(crate) wheres: Vec<Where>,
	pub(crate) _phantom: PhantomData<R>,
}

// -------------- //
// Implémentation //
// -------------- //

impl<D, R> SQLQuerySelectBuilder<D, R>
{
	pub fn where_eq(&mut self, where_eq: impl Into<WhereAnd>) -> &mut Self
	{
		self.wheres.push(Where::And(where_eq.into()));
		self
	}

	pub fn where_and(&mut self, where_and: impl Into<WhereAnd>) -> &mut Self
	{
		self.wheres.push(Where::And(where_and.into()));
		self
	}

	pub fn where_or(&mut self, where_or: impl Into<WhereOr>) -> &mut Self
	{
		self.wheres.push(Where::Or(where_or.into()));
		self
	}
}
