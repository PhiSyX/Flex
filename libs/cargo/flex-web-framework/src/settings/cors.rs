// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashSet;
use std::fmt;

use crate::http;

// --------- //
// Structure //
// --------- //

/// Paramètres CORS.
#[derive(Clone)]
#[derive(Debug)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct Settings
{
	/// Utiliser un pré-réglage CORS.
	#[serde(skip_serializing_if = "Option::is_none")]
	pub preset: Option<SettingsPreset>,
	/// Paramètres CORS pour l'en-tête « Access-Control-Allow-Credentials ».
	#[serde(skip_serializing_if = "Option::is_none")]
	pub allow_credentials: Option<bool>,
	/// Paramètres CORS pour l'en-tête « Access-Control-Allow-Headers ».
	#[serde(skip_serializing_if = "Option::is_none")]
	pub allow_headers: Option<SettingsAllowHeaders>,
	/// Paramètres CORS pour l'en-tête « Access-Control-Allow-Methods ».
	#[serde(skip_serializing_if = "Option::is_none")]
	pub allow_methods: Option<SettingsAllowMethods>,
	/// Paramètres CORS pour l'en-tête « Access-Control-Allow-Origin ».
	#[serde(skip_serializing_if = "Option::is_none")]
	pub allow_origin: Option<SettingsAllowOrigin>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub allow_private_network: Option<bool>,
	/// Paramètres CORS pour l'en-tête « Access-Control-Expose-Headers ».
	#[serde(skip_serializing_if = "Option::is_none")]
	pub expose_headers: Option<SettingsExposeHeaders>,
	/// Paramètres CORS pour l'en-tête « Access-Control-Max-Age ».
	#[serde(skip_serializing_if = "Option::is_none")]
	pub max_age: Option<SettingsMaxAge>,
	/// Paramètres CORS pour l'en-tête « Vary ».
	#[serde(skip_serializing_if = "Option::is_none")]
	pub vary: Option<SettingsVary>,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Clone)]
#[derive(Debug)]
#[derive(serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub enum SettingsPreset
{
	Default,
	Permissive,
	VeryPermissive,
}

#[derive(Clone)]
#[derive(Debug)]
#[derive(serde::Deserialize, serde::Serialize)]
#[serde(untagged)]
pub enum SettingsAllowHeaders
{
	#[serde(deserialize_with = "wildcard_only")]
	Any(char),
	List(HashSet<String>),
}

#[derive(Clone)]
#[derive(Debug)]
#[derive(serde::Deserialize, serde::Serialize)]
#[serde(untagged)]
pub enum SettingsAllowMethods
{
	#[serde(deserialize_with = "wildcard_only")]
	Any(char),
	Exact(http::Method),
	List(HashSet<http::Method>),
}

#[derive(Clone)]
#[derive(Debug)]
#[derive(serde::Deserialize, serde::Serialize)]
#[serde(untagged)]
pub enum SettingsAllowOrigin
{
	#[serde(deserialize_with = "wildcard_only")]
	Any(char),
	Exact(url::Url),
	List(HashSet<url::Url>),
}

#[derive(Clone)]
#[derive(Debug)]
#[derive(serde::Deserialize, serde::Serialize)]
#[serde(untagged)]
pub enum SettingsExposeHeaders
{
	#[serde(deserialize_with = "wildcard_only")]
	Any(char),
	List(HashSet<CorsSettingsHeadersSafeList>),
}

#[derive(Clone)]
#[derive(Debug)]
#[derive(serde::Deserialize, serde::Serialize)]
#[serde(untagged)]
pub enum SettingsMaxAge
{
	Exact(u64),
}

#[derive(Clone)]
#[derive(Debug)]
#[derive(serde::Deserialize, serde::Serialize)]
#[serde(untagged)]
pub enum SettingsVary
{
	List(HashSet<String>),
}

#[derive(Clone)]
#[derive(Debug)]
#[derive(PartialEq, Eq, Hash)]
#[derive(serde::Deserialize, serde::Serialize)]
pub enum CorsSettingsHeadersSafeList
{
	#[serde(rename = "Cache-Control")]
	CacheControl,
	#[serde(rename = "Content-Language")]
	ContentLanguage,
	#[serde(rename = "Content-Length")]
	ContentLength,
	#[serde(rename = "Content-Type")]
	ContentType,
	Expires,
	#[serde(rename = "Last-Modified")]
	LastModified,
	Pragma,
}

// -------- //
// Fonction //
// -------- //

fn wildcard_only<'de, D>(deserializer: D) -> Result<char, D::Error>
where
	D: serde::Deserializer<'de>,
{
	let value = <_ as serde::Deserialize>::deserialize(deserializer)?;
	if value != '*' {
		return Err(serde::de::Error::custom(
			"Seul le caractère '*' est autorisé.",
		));
	}
	Ok(value)
}

// -------------- //
// Implémentation //
// -------------- //

impl Settings
{
	pub const FILENAME: &'static str = "cors";
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl fmt::Display for CorsSettingsHeadersSafeList
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		let header = match self {
			| Self::CacheControl => "CacheControl",
			| Self::ContentLanguage => "ContentLanguage",
			| Self::ContentLength => "ContentLength",
			| Self::ContentType => "ContentType",
			| Self::Expires => "Expires",
			| Self::LastModified => "LastModified",
			| Self::Pragma => "Pragma",
		};
		write!(f, "{}", header)
	}
}

// CorsLayer

impl From<&Settings> for tower_http::cors::CorsLayer
{
	fn from(settings: &Settings) -> Self
	{
		type Preset = SettingsPreset;

		let mut cors_layer = match settings.preset {
			| Some(Preset::Default) => Self::default(),
			| Some(Preset::Permissive) => Self::permissive(),
			| Some(Preset::VeryPermissive) => Self::very_permissive(),
			| None => Self::default(),
		};

		if let Some(ac) = settings.allow_credentials.as_ref() {
			cors_layer = cors_layer.allow_credentials(*ac);
		}

		if let Some(ah) = settings.allow_headers.as_ref() {
			cors_layer = cors_layer.allow_headers(ah);
		}

		if let Some(am) = settings.allow_methods.as_ref() {
			cors_layer = cors_layer.allow_methods(am);
		}

		if let Some(ao) = settings.allow_origin.as_ref() {
			cors_layer = cors_layer.allow_origin(ao);
		}

		if let Some(apn) = settings.allow_private_network {
			cors_layer = cors_layer.allow_private_network(apn);
		}

		if let Some(eh) = settings.expose_headers.as_ref() {
			cors_layer = cors_layer.expose_headers(eh);
		}

		if let Some(ma) = settings.max_age.as_ref() {
			cors_layer = cors_layer.max_age(ma);
		}

		if let Some(v) = settings.vary.as_ref() {
			cors_layer = cors_layer.vary(v);
		}

		cors_layer
	}
}

impl From<Settings> for tower_http::cors::CorsLayer
{
	fn from(settings: Settings) -> Self
	{
		type Preset = SettingsPreset;

		let mut cors_layer = match settings.preset {
			| Some(Preset::Default) => Self::default(),
			| Some(Preset::Permissive) => Self::permissive(),
			| Some(Preset::VeryPermissive) => Self::very_permissive(),
			| None => Self::default(),
		};

		if let Some(ac) = settings.allow_credentials.as_ref() {
			cors_layer = cors_layer.allow_credentials(*ac);
		}

		if let Some(ah) = settings.allow_headers.as_ref() {
			cors_layer = cors_layer.allow_headers(ah);
		}

		if let Some(am) = settings.allow_methods.as_ref() {
			cors_layer = cors_layer.allow_methods(am);
		}

		if let Some(ao) = settings.allow_origin.as_ref() {
			cors_layer = cors_layer.allow_origin(ao);
		}

		if let Some(apn) = settings.allow_private_network {
			cors_layer = cors_layer.allow_private_network(apn);
		}

		if let Some(eh) = settings.expose_headers.as_ref() {
			cors_layer = cors_layer.expose_headers(eh);
		}

		if let Some(ma) = settings.max_age.as_ref() {
			cors_layer = cors_layer.max_age(ma);
		}

		if let Some(v) = settings.vary.as_ref() {
			cors_layer = cors_layer.vary(v);
		}

		cors_layer
	}
}

impl TryFrom<&CorsSettingsHeadersSafeList> for axum::http::HeaderName
{
	type Error = hyper::header::InvalidHeaderName;

	fn try_from(
		settings: &CorsSettingsHeadersSafeList,
	) -> Result<Self, Self::Error>
	{
		settings.to_string().parse()
	}
}

impl From<&SettingsAllowHeaders> for tower_http::cors::AllowHeaders
{
	fn from(this: &SettingsAllowHeaders) -> Self
	{
		match this {
			| SettingsAllowHeaders::Any(_) => Self::any(),
			| SettingsAllowHeaders::List(list) => {
				Self::list(list.iter().flat_map(to_header_name))
			}
		}
	}
}

impl From<&SettingsAllowMethods> for tower_http::cors::AllowMethods
{
	fn from(this: &SettingsAllowMethods) -> Self
	{
		match this {
			| SettingsAllowMethods::Any(_) => Self::any(),

			| SettingsAllowMethods::Exact(method) => {
				Self::exact(match method {
					| http::Method::DELETE => axum::http::Method::DELETE,
					| http::Method::GET => axum::http::Method::GET,
					| http::Method::HEAD => axum::http::Method::HEAD,
					| http::Method::OPTIONS => axum::http::Method::OPTIONS,
					| http::Method::PATCH => axum::http::Method::PATCH,
					| http::Method::POST => axum::http::Method::POST,
					| http::Method::PUT => axum::http::Method::PUT,
					| http::Method::TRACE => axum::http::Method::TRACE,
				})
			}

			| SettingsAllowMethods::List(list) => {
				Self::list(list.iter().map(|method| {
					match method {
						| http::Method::DELETE => axum::http::Method::DELETE,
						| http::Method::GET => axum::http::Method::GET,
						| http::Method::HEAD => axum::http::Method::HEAD,
						| http::Method::OPTIONS => axum::http::Method::OPTIONS,
						| http::Method::PATCH => axum::http::Method::PATCH,
						| http::Method::POST => axum::http::Method::POST,
						| http::Method::PUT => axum::http::Method::PUT,
						| http::Method::TRACE => axum::http::Method::TRACE,
					}
				}))
			}
		}
	}
}

impl From<&SettingsAllowOrigin> for tower_http::cors::AllowOrigin
{
	fn from(this: &SettingsAllowOrigin) -> Self
	{
		match this {
			| SettingsAllowOrigin::Any(_) => Self::any(),
			| SettingsAllowOrigin::Exact(url) => {
				to_header_value(url).map(Self::exact).unwrap_or_default()
			}
			| SettingsAllowOrigin::List(list) => {
				Self::list(list.iter().flat_map(to_header_value))
			}
		}
	}
}

impl From<&SettingsExposeHeaders> for tower_http::cors::ExposeHeaders
{
	fn from(this: &SettingsExposeHeaders) -> Self
	{
		match this {
			| SettingsExposeHeaders::Any(_) => Self::any(),
			| SettingsExposeHeaders::List(list) => {
				Self::list(list.iter().flat_map(to_header_name))
			}
		}
	}
}

impl From<&SettingsMaxAge> for tower_http::cors::MaxAge
{
	fn from(this: &SettingsMaxAge) -> Self
	{
		use std::time::Duration;

		match this {
			| SettingsMaxAge::Exact(secs) => {
				Self::exact(Duration::from_secs(*secs))
			}
		}
	}
}

impl From<&SettingsVary> for tower_http::cors::Vary
{
	fn from(this: &SettingsVary) -> Self
	{
		match this {
			| SettingsVary::List(list) => {
				Self::list(list.iter().flat_map(to_header_name))
			}
		}
	}
}

// -------- //
// Fonction //
// -------- //

#[inline]
fn to_header_value(
	url: &url::Url,
) -> Result<axum::http::HeaderValue, hyper::header::InvalidHeaderValue>
{
	url.to_string().trim_end_matches('/').parse()
}

#[inline]
fn to_header_name<MaybeHeader>(
	header: MaybeHeader,
) -> Result<axum::http::HeaderName, hyper::header::InvalidHeaderName>
where
	MaybeHeader: TryInto<
		axum::http::HeaderName,
		Error = hyper::header::InvalidHeaderName,
	>,
{
	header.try_into()
}
