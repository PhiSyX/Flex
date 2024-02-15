// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::ops;

pub use tower_cookies::{Cookie, Cookies as TowerCookies, Key};

// --------- //
// Structure //
// --------- //

pub struct Cookies<'c>
{
	manager: &'c TowerCookies,
	key: &'c Key,
}

// -------------- //
// Implémentation //
// -------------- //

impl<'c> Cookies<'c>
{
	pub fn new(manager: &'c tower_cookies::Cookies, key: &'c Key) -> Self
	{
		Self { manager, key }
	}
}

impl<'c> Cookies<'c>
{
	pub fn private(&self) -> tower_cookies::PrivateCookies<'_>
	{
		self.manager.private(self.key)
	}

	pub fn signed(&self) -> tower_cookies::SignedCookies<'_>
	{
		self.manager.signed(self.key)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'c> ops::Deref for Cookies<'c>
{
	type Target = tower_cookies::Cookies;

	fn deref(&self) -> &Self::Target
	{
		self.manager
	}
}
