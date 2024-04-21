// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use time::Duration;
use tower_sessions::{Expiry, MemoryStore, SessionManagerLayer};

use crate::AxumApplication;

// --------- //
// Interface //
// --------- //

/// Extension d'application "Cookie Layer"
pub trait ApplicationCookieLayerExtension
{
	/// Définit une clé de cookie.
	fn define_cookie_key(self, key: impl TryInto<tower_cookies::Key>) -> Self;

	/// Applique un layer cookie au serveur.
	fn use_cookie_layer(self) -> Self;
}

// -------------- //
// Implémentation //
// -------------- //

impl<S, E, C> ApplicationCookieLayerExtension for AxumApplication<S, E, C>
where
	S: Clone,
{
	fn define_cookie_key(
		mut self,
		key: impl TryInto<tower_cookies::Key>,
	) -> Self
	{
		let Ok(cookie_key) = key.try_into() else {
			let reason = "La clé de cookie reçue lors de l'initialisation de \
			              l'application est incorrecte.";
			self.signal().send_critical(reason);
		};
		self.application_adapter.state.set_cookie_key(cookie_key);
		self
	}

	#[rustfmt::skip]
	fn use_cookie_layer(mut self) -> Self
	{
		if self.application_adapter.state.cookie_key().is_none() {
			let reason = "Vous devez définir une clé de cookie avec \
			              YourApp#define_cookie_key avant d'utiliser le layer \
			              de cookie";
			self.signal().send_critical(reason);
		};

		let cookie_settings = self.application_adapter.state.clone().cookie_settings();

		let session_store = MemoryStore::default();
		let mut session_layer = SessionManagerLayer::new(session_store)
			.with_name("flex.session")
			.with_path(cookie_settings.path);

		if let Some(domain) = cookie_settings.domain {
			session_layer = session_layer.with_domain(domain);
		}
		if let Some(b) = cookie_settings.http_only {
			session_layer = session_layer.with_http_only(b);
		}
		if let Some(secs) = cookie_settings.max_age {
			session_layer = session_layer .with_expiry(
				Expiry::OnInactivity(Duration::seconds(secs))
			);
		}
		if let Some(b) = cookie_settings.secure {
			session_layer = session_layer.with_secure(b);
		}
		if let Some(sm) = cookie_settings.same_site {
			session_layer = session_layer.with_same_site(sm.into());
		}

		self.application_adapter.router.global = self.application_adapter.router.global
			.layer(session_layer)
			.layer(tower_cookies::CookieManagerLayer::new());

		self
	}
}
