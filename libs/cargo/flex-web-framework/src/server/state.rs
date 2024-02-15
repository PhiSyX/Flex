// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Structure //
// --------- //

#[derive(Default)]
#[derive(Clone)]
pub struct ServerState
{
	cookie_key: Option<tower_cookies::Key>,
}

// -------------- //
// Implémentation //
// -------------- //

impl ServerState
{
	pub fn cookie_key(&self) -> Option<&tower_cookies::Key>
	{
		self.cookie_key.as_ref()
	}

	pub fn get_cookie_key(&self) -> &tower_cookies::Key
	{
		assert!(self.cookie_key.is_some());
		self.cookie_key.as_ref().unwrap()
	}

	pub fn set_cookie_key(&mut self, cookie_key: tower_cookies::Key)
	{
		self.cookie_key.replace(cookie_key);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl axum::extract::FromRef<ServerState> for tower_cookies::Key
{
	fn from_ref(state: &ServerState) -> Self
	{
		state.cookie_key.clone().expect("Clé de cookie.")
	}
}
