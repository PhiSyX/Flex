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

use hyper::{http, StatusCode};
use tower_cookies::cookie::CookieBuilder;
pub use tower_cookies::cookie::SameSite;
pub use tower_cookies::{Cookie as TowerCookie, Cookies as TowerCookies, Key};

use crate::settings::CookieSettings;
use crate::AxumState;

// --------- //
// Structure //
// --------- //

pub struct Cookie<'c>(CookieBuilder<'c>);

pub struct Cookies
{
	settings: CookieSettings,
	manager: TowerCookies,
	key: Key,
}

pub struct PrivateCookies<'p>
{
	inner: tower_cookies::PrivateCookies<'p>,
	settings: &'p CookieSettings,
}

pub struct SignedCookies<'s>
{
	inner: tower_cookies::SignedCookies<'s>,
	settings: &'s CookieSettings,
}

// -------------- //
// Implémentation //
// -------------- //

impl Cookies
{
	pub fn new(manager: tower_cookies::Cookies, key: Key) -> Self
	{
		Self {
			manager,
			key,
			settings: Default::default(),
		}
	}

	pub fn with_cookie_settings(mut self, settings: CookieSettings) -> Self
	{
		self.settings = settings;
		self
	}
}

impl Cookies
{
	pub fn private(&self) -> PrivateCookies<'_>
	{
		PrivateCookies {
			inner: self.manager.private(&self.key),
			settings: &self.settings,
		}
	}

	pub fn signed(&self) -> SignedCookies<'_>
	{
		SignedCookies {
			inner: self.manager.signed(&self.key),
			settings: &self.settings,
		}
	}
}

impl<'s> PrivateCookies<'s>
{
	pub fn add<C: Into<Cookie<'static>>>(&self, cookie: C)
	{
		let user_cookie: TowerCookie = cookie.into().0.build();
		let has_max_age = user_cookie.max_age().is_some();

		let mut cookie_builder = CookieBuilder::from(user_cookie);

		if let Some(domain) = self.settings.domain.as_ref() {
			cookie_builder = cookie_builder.domain(domain.clone());
		}

		if !has_max_age {
			if let Some(expires) = self.settings.expires {
				cookie_builder = cookie_builder.expires(
					time::OffsetDateTime::now_utc()
						.checked_add(time::Duration::seconds(expires)),
				);
			}
		}

		if let Some(http_only) = self.settings.http_only {
			cookie_builder = cookie_builder.http_only(http_only);
		}

		if !has_max_age {
			if let Some(max_age) = self.settings.max_age {
				cookie_builder = cookie_builder.max_age(
					time::Duration::seconds(max_age)
				);
			}
		}

		if let Some(same_site) = self.settings.same_site {
			cookie_builder = cookie_builder.same_site(same_site.into());
		}

		if let Some(secure) = self.settings.secure {
			cookie_builder = cookie_builder.secure(secure);
		}

		cookie_builder = cookie_builder.path(self.settings.path.clone());

		self.inner.add(cookie_builder.build());
	}

	pub fn get(&self, name: &str) -> Option<TowerCookie<'s>>
	{
		self.inner.get(name)
	}

	pub fn remove<K>(&self, name: K)
	where
		K: Into<std::borrow::Cow<'static, str>>,
	{
		self.inner.remove(TowerCookie::from(name.into()))
	}
}

impl<'s> SignedCookies<'s>
{
	pub fn add<C: Into<Cookie<'static>>>(&self, cookie: C)
	{
		let user_cookie: TowerCookie = cookie.into().0.build();
		let has_max_age = user_cookie.max_age().is_some();

		let mut cookie_builder = CookieBuilder::from(user_cookie);

		if let Some(domain) = self.settings.domain.as_ref() {
			cookie_builder = cookie_builder.domain(domain.clone());
		}

		if !has_max_age {
			if let Some(expires) = self.settings.expires {
				cookie_builder = cookie_builder.expires(
					time::OffsetDateTime::now_utc()
						.checked_add(time::Duration::seconds(expires)),
				);
			}
		}

		if let Some(http_only) = self.settings.http_only {
			cookie_builder = cookie_builder.http_only(http_only);
		}

		if !has_max_age {
			if let Some(max_age) = self.settings.max_age {
				cookie_builder = cookie_builder.max_age(
					time::Duration::seconds(max_age)
				);
			}
		}

		if let Some(same_site) = self.settings.same_site {
			cookie_builder = cookie_builder.same_site(same_site.into());
		}

		if let Some(secure) = self.settings.secure {
			cookie_builder = cookie_builder.secure(secure);
		}

		cookie_builder = cookie_builder.path(self.settings.path.clone());

		self.inner.add(cookie_builder.build());
	}

	pub fn get(&self, name: &str) -> Option<TowerCookie<'s>>
	{
		self.inner.get(name)
	}

	pub fn remove<K>(&self, name: K)
	where
		K: Into<std::borrow::Cow<'static, str>>,
	{
		let cookie: Cookie<'_> = (name, "").into();
		let user_cookie: TowerCookie = cookie.0.build();
		let has_max_age = user_cookie.max_age().is_some();

		let mut cookie_builder = CookieBuilder::from(user_cookie);

		if let Some(domain) = self.settings.domain.as_ref() {
			cookie_builder = cookie_builder.domain(domain.clone());
		}

		if !has_max_age {
			if let Some(expires) = self.settings.expires {
				cookie_builder = cookie_builder.expires(
					time::OffsetDateTime::now_utc()
						.checked_add(time::Duration::seconds(expires)),
				);
			}
		}

		if let Some(http_only) = self.settings.http_only {
			cookie_builder = cookie_builder.http_only(http_only);
		}

		if !has_max_age {
			if let Some(max_age) = self.settings.max_age {
				cookie_builder = cookie_builder.max_age(
					time::Duration::seconds(max_age)
				);
			}
		}

		if let Some(same_site) = self.settings.same_site {
			cookie_builder = cookie_builder.same_site(same_site.into());
		}

		if let Some(secure) = self.settings.secure {
			cookie_builder = cookie_builder.secure(secure);
		}

		cookie_builder = cookie_builder.path(self.settings.path.clone());

		self.inner.remove(cookie_builder.build())
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ops::Deref for Cookies
{
	type Target = tower_cookies::Cookies;

	fn deref(&self) -> &Self::Target
	{
		&self.manager
	}
}

impl<N, V> From<(N, V)> for Cookie<'_>
where
	N: Into<std::borrow::Cow<'static, str>>,
	V: Into<std::borrow::Cow<'static, str>>,
{
	fn from(cookie: (N, V)) -> Self
	{
		Self(TowerCookie::build(cookie))
	}
}

impl<N, V, MaxAge> From<(N, V, MaxAge)> for Cookie<'_>
where
	N: Into<std::borrow::Cow<'static, str>>,
	V: Into<std::borrow::Cow<'static, str>>,
	MaxAge: Into<time::Duration>,
{
	fn from((name, value, max_age): (N, V, MaxAge)) -> Self
	{
		Self(TowerCookie::build((name, value)).max_age(max_age.into()))
	}
}

impl<N, V> From<(N, V, CookieSettings)> for Cookie<'_>
where
	N: Into<std::borrow::Cow<'static, str>>,
	V: Into<std::borrow::Cow<'static, str>>,
{
	fn from((name, value, settings): (N, V, CookieSettings)) -> Self
	{
		let mut cookie_builder = TowerCookie::build((name, value));

		if let Some(domain) = settings.domain.as_ref() {
			cookie_builder = cookie_builder.domain(domain.clone());
		}

		if let Some(expires) = settings.expires {
			cookie_builder = cookie_builder.expires(
				time::OffsetDateTime::now_utc()
					.checked_add(time::Duration::seconds(expires)),
			);
		}

		if let Some(http_only) = settings.http_only {
			cookie_builder = cookie_builder.http_only(http_only);
		}

		if let Some(max_age) = settings.max_age {
			cookie_builder = cookie_builder.max_age(
				time::Duration::seconds(max_age)
			);
		}

		if let Some(same_site) = settings.same_site {
			cookie_builder = cookie_builder.same_site(same_site.into());
		}

		if let Some(secure) = settings.secure {
			cookie_builder = cookie_builder.secure(secure);
		}

		cookie_builder = cookie_builder.path(settings.path.clone());

		Self(cookie_builder)
	}
}

#[axum::async_trait]
impl<S> axum::extract::FromRequestParts<AxumState<S>> for Cookies
where
	S: Send + Sync + 'static,
{
	type Rejection = (http::StatusCode, &'static str);

	async fn from_request_parts(
		parts: &mut http::request::Parts,
		state: &AxumState<S>,
	) -> Result<Self, Self::Rejection>
	{
		let cm = parts.extensions.get::<tower_cookies::Cookies>()
			.cloned()
			.ok_or((
				StatusCode::INTERNAL_SERVER_ERROR,
				"Impossible d'extraire les cookies",
			))?;
		let cookie_key = state.cookie_key().cloned().ok_or((
			StatusCode::INTERNAL_SERVER_ERROR,
			"Impossible de récupérer la clé de cookie",
		))?;
		let cookie_settings = state.get_cookie_settings();
		let cookie_manager = Self::new(cm, cookie_key)
			.with_cookie_settings(cookie_settings.clone());
		Ok(cookie_manager)
	}
}
