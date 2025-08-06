// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::BTreeMap;
use std::marker::PhantomData;

use super::SQLQuerySelectAllFields;
use super::wheres::{Where, WhereAnd, WhereOr};

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct SQLQueryUpdateBuilder<D, R>
{
	pub(crate) table: String,
	pub(crate) db: D,
	pub(crate) props: BTreeMap<String, Option<String>>,
	pub(crate) wheres: Vec<Where>,
	pub(crate) returning: Vec<String>,
	pub(crate) _phantom: PhantomData<R>,
}

pub struct UpdateProps(pub BTreeMap<String, Option<String>>);

// -------------- //
// Implémentation //
// -------------- //

impl<D, R> SQLQueryUpdateBuilder<D, R>
{
	pub fn returning_all(&mut self) -> &mut Self
	where
		R: SQLQuerySelectAllFields,
	{
		self.returning.extend(R::fields().into_iter().map(Into::into));
		self
	}

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

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<K, V> From<(K, V)> for UpdateProps
where
	K: ToString,
	V: ToString,
{
	fn from((k, v): (K, V)) -> Self
	{
		Self(BTreeMap::from_iter([(k.to_string(), Some(v.to_string()))]))
	}
}

impl<K, V, const N: usize> From<[(K, V); N]> for UpdateProps
where
	K: ToString,
	V: ToString,
{
	fn from(props: [(K, V); N]) -> Self
	{
		Self(BTreeMap::from_iter(props.iter().map(|(k, v)| {
			let v = v.to_string();
			if v.is_empty() {
				return (k.to_string(), None);
			}
			(k.to_string(), Some(v))
		})))
	}
}

impl<K, V> From<&[(K, V)]> for UpdateProps
where
	K: ToString,
	V: ToString,
{
	fn from(props: &[(K, V)]) -> Self
	{
		Self(BTreeMap::from_iter(props.iter().map(|(k, v)| {
			let v = v.to_string();
			if v.is_empty() {
				return (k.to_string(), None);
			}
			(k.to_string(), Some(v))
		})))
	}
}
