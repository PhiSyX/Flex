// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::ops;

use crate::AsyncExtensionInterface;

// --------- //
// Interface //
// --------- //

pub trait DatabaseInterface
{
	async fn new(database_url: impl Into<url::Url>) -> Self;
}

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct DatabaseService<T>
{
	sgbd: T,
}

// -------------- //
// Implémentation //
// -------------- //

impl<T> DatabaseService<T>
{
	pub fn sgbd(&self) -> &T
	{
		&self.sgbd
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<T> AsyncExtensionInterface for DatabaseService<T>
where
	T: 'static,
	T: DatabaseInterface,
	T: Clone,
	T: Send + Sync,
{
	type Payload = url::Url;

	async fn new(payload: Self::Payload) -> Self
	{
		Self {
			sgbd: T::new(payload).await,
		}
	}
}

impl<T> ops::Deref for DatabaseService<T>
{
	type Target = T;

	fn deref(&self) -> &Self::Target
	{
		&self.sgbd
	}
}
