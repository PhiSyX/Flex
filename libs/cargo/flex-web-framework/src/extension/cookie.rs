// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::AxumApplication;

// --------- //
// Interface //
// --------- //

/// Extension d'application "Cookie Layer"
pub trait ApplicationCookieLayerExtension: Sized
{
	/// Définit une clé de cookie.
	fn define_cookie_key(self, key: impl TryInto<tower_cookies::Key>) -> Self;

	/// Applique un layer cookie au serveur.
	fn use_cookie_layer(self) -> Self;
}

// -------------- //
// Implémentation //
// -------------- //

impl<E, C> ApplicationCookieLayerExtension for AxumApplication<E, C>
{
	fn define_cookie_key(mut self, key: impl TryInto<tower_cookies::Key>) -> Self
	{
		let Ok(cookie_key) = key.try_into() else {
			self.signal().send_critical(
				"La clé de cookie reçue lors de l'initialisation de l'application est incorrecte.",
			);
		};

		self.application_adapter.state.set_cookie_key(cookie_key);

		self
	}

	fn use_cookie_layer(mut self) -> Self
	{
		if self.application_adapter.state.cookie_key().is_none() {
			self.signal().send_critical(
				"Vous devez définir une clé de cookie avec YourApp#define_cookie_key avant \
				 d'utiliser le layer de cookie",
			);
		};

		self.application_adapter.router.global = self
			.application_adapter
			.router
			.global
			.layer(tower_cookies::CookieManagerLayer::new());

		self
	}
}
