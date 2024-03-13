// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::settings::CookieSettings;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct ServerState<UserState>
{
	cookie_settings: CookieSettings,
	cookie_key: Option<tower_cookies::Key>,
	user: Option<UserState>,
}

// -------------- //
// Implémentation //
// -------------- //

impl<S> ServerState<S>
{
	pub fn cookie_key(&self) -> Option<&tower_cookies::Key>
	{
		self.cookie_key.as_ref()
	}


	pub fn cookie_settings(self) -> CookieSettings
	{
		self.cookie_settings
	}

	pub fn get_cookie_settings(&self) -> &CookieSettings
	{
		&self.cookie_settings
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

	pub fn set_cookie_settings(&mut self, cookie_settings: CookieSettings)
	{
		self.cookie_settings = cookie_settings;
	}
}

impl<S> ServerState<S>
{
	pub fn state(&self) -> &S
	{
		self.user.as_ref().expect(
			"Le state n'est pas définit. Vérifier que `ServerState#set_state` est bien appelée \
			 avant.",
		)
	}

	pub fn set_state(&mut self, state: S)
	{
		self.user.replace(state);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<S> axum::extract::FromRef<ServerState<S>> for CookieSettings
{
	fn from_ref(state: &ServerState<S>) -> Self
	{
		state.cookie_settings.clone()
	}
}

impl<S> axum::extract::FromRef<ServerState<S>> for tower_cookies::Key
{
	fn from_ref(state: &ServerState<S>) -> Self
	{
		state.cookie_key.clone().expect("Clé de cookie.")
	}
}

impl<S> Default for ServerState<S>
{
	fn default() -> Self
	{
		Self {
			cookie_settings: Default::default(),
			cookie_key: Default::default(),
			user: Default::default(),
		}
	}
}
