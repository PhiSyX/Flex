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

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct WhereAnd(BTreeMap<String, String>);
#[derive(Clone)]
pub struct WhereOr(BTreeMap<String, String>);

// ----------- //
// Énumération //
// ----------- //

#[derive(Clone)]
pub enum Where
{
	And(WhereAnd),
	Or(WhereOr),
}

// -------------- //
// Implémentation //
// -------------- //

impl Where
{
	pub fn is_empty(&self) -> bool
	{
		self.len() == 0
	}

	pub fn len(&self) -> usize
	{
		match self {
			| Self::And(w) => w.0.len(),
			| Self::Or(w) => w.0.len(),
		}
	}

	pub fn entries(&self) -> Vec<(usize, (&String, &String))>
	{
		let mut v = Vec::new();

		match self {
			| Self::And(w) => v.extend(w.0.iter().enumerate()),
			| Self::Or(w) => v.extend(w.0.iter().enumerate()),
		};

		v
	}

	pub fn values(&self) -> Vec<&String>
	{
		match self {
			| Self::And(w) => Vec::from_iter(w.0.values()),
			| Self::Or(w) => Vec::from_iter(w.0.values()),
		}
	}

	pub fn term(&self) -> &str
	{
		match self {
			| Self::And(_) => "AND",
			| Self::Or(_) => "OR",
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<K, V> From<(K, V)> for WhereAnd
where
	K: ToString,
	V: ToString,
{
	fn from((k, v): (K, V)) -> Self
	{
		let mut map = BTreeMap::new();
		map.insert(k.to_string(), v.to_string());
		Self(map)
	}
}
impl<K, V, const N: usize> From<[(K, V); N]> for WhereAnd
where
	K: ToString,
	V: ToString,
{
	fn from(values: [(K, V); N]) -> Self
	{
		let map = BTreeMap::from_iter(
			values.map(|(k, v)| (k.to_string(), v.to_string())),
		);
		Self(map)
	}
}

impl<'a, K, V> From<&'a [(K, V)]> for WhereAnd
where
	K: ToString,
	V: ToString,
{
	fn from(values: &'a [(K, V)]) -> Self
	{
		let map = BTreeMap::from_iter(
			values.iter().map(|(k, v)| (k.to_string(), v.to_string())),
		);
		Self(map)
	}
}

impl<K, V> From<(K, V)> for WhereOr
where
	K: ToString,
	V: ToString,
{
	fn from((k, v): (K, V)) -> Self
	{
		let mut map = BTreeMap::new();
		map.insert(k.to_string(), v.to_string());
		Self(map)
	}
}

impl<K, V, const N: usize> From<[(K, V); N]> for WhereOr
where
	K: ToString,
	V: ToString,
{
	fn from(values: [(K, V); N]) -> Self
	{
		let map = BTreeMap::from_iter(
			values.map(|(k, v)| (k.to_string(), v.to_string())),
		);
		Self(map)
	}
}

impl<'a, K, V> From<&'a [(K, V)]> for WhereOr
where
	K: ToString,
	V: ToString,
{
	fn from(values: &'a [(K, V)]) -> Self
	{
		let map = BTreeMap::from_iter(
			values.iter().map(|(k, v)| (k.to_string(), v.to_string())),
		);
		Self(map)
	}
}
