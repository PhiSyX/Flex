// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::settings::{CookieSettings, ServerSettings};

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct ServerState<UserState>
{
	cookie_settings: CookieSettings,
	cookie_key: Option<tower_cookies::Key>,
	server_settings: ServerSettings,
	user: Option<UserState>,
	wsio: Option<socketioxide::SocketIo>,
	json_rpc: Option<rpc_router::Router>,
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

	pub fn get_server_settings(&self) -> &ServerSettings
	{
		&self.server_settings
	}

	pub fn set_cookie_key(&mut self, cookie_key: tower_cookies::Key)
	{
		self.cookie_key.replace(cookie_key);
	}

	pub fn set_cookie_settings(&mut self, cookie_settings: CookieSettings)
	{
		self.cookie_settings = cookie_settings;
	}

	pub fn set_server_settings(&mut self, server_settings: ServerSettings)
	{
		self.server_settings = server_settings;
	}
}

impl<S> ServerState<S>
{
	pub fn ws(&self) -> &socketioxide::SocketIo
	{
		self.wsio.as_ref().unwrap()
	}

	pub fn set_ws(&mut self, io: socketioxide::SocketIo)
	{
		self.wsio.replace(io);
	}
}

impl<S> ServerState<S>
{
	pub fn json_rpc(&self) -> &rpc_router::Router
	{
		self.json_rpc.as_ref().unwrap()
	}

	pub fn set_json_rpc(&mut self, router: rpc_router::Router)
	{
		self.json_rpc.replace(router);
	}
}

impl<S> ServerState<S>
{
	pub fn state(&self) -> &S
	{
		self.user.as_ref().expect(
			"Le state n'est pas définit. Vérifier que `ServerState#set_state` \
			 est bien appelée avant.",
		)
	}

	pub fn state_mut(&mut self) -> &mut S
	{
		self.user.as_mut().expect(
			"Le state n'est pas définit. Vérifier que `ServerState#set_state` \
			 est bien appelée avant.",
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

impl<S> axum::extract::FromRef<ServerState<S>> for ServerSettings
{
	fn from_ref(state: &ServerState<S>) -> Self
	{
		state.server_settings.clone()
	}
}

impl<S> axum::extract::FromRef<ServerState<S>> for socketioxide::SocketIo
{
	fn from_ref(state: &ServerState<S>) -> Self
	{
		state.wsio.clone().expect("Instance SocketIO")
	}
}

impl<S> axum::extract::FromRef<ServerState<S>> for tower_cookies::Key
{
	fn from_ref(state: &ServerState<S>) -> Self
	{
		state.cookie_key.clone().expect("Clé de cookie.")
	}
}

impl<S> axum::extract::FromRef<ServerState<S>> for rpc_router::Router
{
	fn from_ref(state: &ServerState<S>) -> Self
	{
		state.json_rpc.clone().expect("RPC Router")
	}
}

impl<S> axum::extract::FromRef<ServerState<S>> for ()
{
	fn from_ref(_: &ServerState<S>) -> Self {}
}

impl<S> Default for ServerState<S>
{
	fn default() -> Self
	{
		Self {
			cookie_settings: Default::default(),
			cookie_key: Default::default(),
			server_settings: Default::default(),
			user: Default::default(),
			wsio: Default::default(),
			json_rpc: Default::default(),
		}
	}
}
