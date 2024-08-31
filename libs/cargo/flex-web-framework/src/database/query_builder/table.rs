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

use super::insert::SQLQueryInsertBuilder;
use super::select::{SQLQuerySelectAllFields, SQLQuerySelectBuilder};
use super::update::{SQLQueryUpdateBuilder, UpdateProps};

pub struct SQLQueryBuilderTable<D, R>
where
	D: Clone,
{
	pub(crate) db: D,
	pub(crate) name: String,
	pub(crate) select: Option<SQLQuerySelectBuilder<D, R>>,
	pub(crate) insert: Option<SQLQueryInsertBuilder<D, R>>,
	pub(crate) update: Option<SQLQueryUpdateBuilder<D, R>>,
	pub(crate) _phantom: PhantomData<R>,
}

impl<D, R> SQLQueryBuilderTable<D, R>
where
	D: Clone,
{
	pub fn select<'a>(
		&self,
		fields: impl IntoIterator<Item = &'a str>,
	) -> SQLQuerySelectBuilder<D, R>
	{
		SQLQuerySelectBuilder {
			db: self.db.clone(),
			table: self.name.to_owned(),
			fields: Vec::from_iter(fields.into_iter().map(Into::into)),
			wheres: Default::default(),
			_phantom: Default::default(),
		}
	}

	pub fn select_all(&self) -> SQLQuerySelectBuilder<D, R>
	where
		R: SQLQuerySelectAllFields,
	{
		SQLQuerySelectBuilder {
			db: self.db.clone(),
			table: self.name.to_owned(),
			fields: Vec::from_iter(R::fields().into_iter().map(Into::into)),
			wheres: Default::default(),
			_phantom: Default::default(),
		}
	}

	pub fn insert<K, V>(
		&self,
		props_raw: impl IntoIterator<Item = (K, V)>,
	) -> SQLQueryInsertBuilder<D, R>
	where
		K: ToString,
		V: ToString,
	{
		let mut props = BTreeMap::new();

		for (field, value) in props_raw {
			props.insert(field.to_string(), value.to_string());
		}

		SQLQueryInsertBuilder {
			table: self.name.clone(),
			db: self.db.clone(),
			props,
			wheres: Default::default(),
			returning: Default::default(),
			_phantom: Default::default(),
		}
	}

	pub fn update(
		&self,
		props_raw: impl Into<UpdateProps>,
	) -> SQLQueryUpdateBuilder<D, R>
	{
		let props: UpdateProps = props_raw.into();
		let map = props.0;
		SQLQueryUpdateBuilder {
			table: self.name.clone(),
			db: self.db.clone(),
			props: map,
			wheres: Default::default(),
			returning: Default::default(),
			_phantom: Default::default(),
		}
	}

	pub fn build(&self) -> String
	{
		let mut temp = String::new();

		if let Some(select) = self.select.as_ref() {
			temp.push_str("SELECT ");
			temp.push_str(&select.fields.join(","));
			temp.push_str(" FROM ");
			temp.push_str(&self.name);

			if !select.wheres.is_empty() {
				temp.push_str(" WHERE ");
			}

			for wh3re in select.wheres.iter() {
				let total = wh3re.len();

				for (idx, (kr, _)) in wh3re.entries() {
					let (k, modifier) = kr.split_once("::").unwrap_or((kr, ""));
					temp.push_str(k);
					temp.push('=');
					let v = format!("${}", idx + 1);
					temp.push_str(&v);
					if !modifier.is_empty() {
						temp.push_str("::");
						temp.push_str(modifier);
					}
					if idx + 1 != total {
						temp.push(' ');
						temp.push_str(wh3re.term());
						temp.push(' ');
					}
				}
			}
		}

		if let Some(insert) = self.insert.as_ref() {
			temp.push_str("INSERT INTO ");
			temp.push_str(&self.name);
			temp.push_str(" (");
			let total = insert.props.len();
			for (idx, kr) in insert.props.keys().enumerate() {
				let (key, _) = kr.split_once("::").unwrap_or((kr, ""));
				temp.push_str(key);
				if idx + 1 != total {
					temp.push(',');
				}
			}
			temp.push_str(") VALUES (");
			let mut idx: usize = 0;
			for (idxx, (kr, value)) in insert.props.iter().enumerate() {
				let (_, modifier) = kr.split_once("::").unwrap_or((kr, ""));
				if value.ends_with("()") {
					temp.push_str(value);
				} else {
					idx = idx.saturating_add(1);
					temp.push_str(&format!("${}", idx));
				}

				if !modifier.is_empty() {
					temp.push_str("::");
					temp.push_str(modifier);
				}
				if idxx + 1 != total {
					temp.push(',');
				}
			}
			temp.push(')');

			if !insert.wheres.is_empty() {
				temp.push_str(" WHERE ");
			}

			for wh3re in insert.wheres.iter() {
				let total = wh3re.len();

				for (_, (kr, _)) in wh3re.entries() {
					idx += 1;

					let (k, modifier) = kr.split_once("::").unwrap_or((kr, ""));
					temp.push_str(k);
					temp.push('=');
					let v = format!("${}", idx);
					temp.push_str(&v);
					if !modifier.is_empty() {
						temp.push_str("::");
						temp.push_str(modifier);
					}
					if idx + 1 != total {
						temp.push(' ');
						temp.push_str(wh3re.term());
						temp.push(' ');
					}
				}
			}
		}

		if let Some(update) = self.update.as_ref() {
			temp.push_str("UPDATE ");
			temp.push_str(&self.name);
			temp.push_str(" SET ");
			let total = update.props.len();

			for (idx, kr) in update.props.keys().enumerate() {
				let (key, modifier) = kr.split_once("::").unwrap_or((kr, ""));
				temp.push_str(key);
				temp.push('=');
				temp.push_str(&format!("${}", idx + 1));
				if !modifier.is_empty() {
					temp.push_str("::");
					temp.push_str(modifier);
				}
				if idx + 1 != total {
					temp.push(',');
				}
			}

			if !update.wheres.is_empty() {
				temp.push_str(" WHERE ");
			}

			let mut idx = total;

			for wh3re in update.wheres.iter() {
				let total = wh3re.len();

				for (idxx, (kr, _)) in wh3re.entries() {
					idx += 1;

					let (k, modifier) = kr.split_once("::").unwrap_or((kr, ""));
					temp.push_str(k);
					temp.push('=');
					let v = format!("${}", idx);
					temp.push_str(&v);
					if !modifier.is_empty() {
						temp.push_str("::");
						temp.push_str(modifier);
					}
					if idxx + 1 != total {
						temp.push(' ');
						temp.push_str(wh3re.term());
						temp.push(' ');
					}
				}
			}
		}

		temp
	}
}
