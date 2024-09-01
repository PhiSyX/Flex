// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::sync::Arc;

pub use axum::extract::{
	ConnectInfo,
	Extension,
	FromRef,
	FromRequest,
	FromRequestParts,
	Host,
	Path,
	Query,
	Request,
	State,
};
use axum::http::HeaderValue;
use hyper::header::ACCEPT;
use hyper::HeaderMap;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
pub struct HttpRequest<T>
{
	#[allow(dead_code)]
	pub(crate) context: Arc<T>,
	pub ip: std::net::IpAddr,
	pub method: hyper::Method,
	pub uri: hyper::Uri,
	pub raw_query: Option<String>,
	pub referer: Option<axum_extra::headers::Referer>,
	pub headers: HeaderMap<HeaderValue>,
}

pub struct HttpRequestHeaderAccept<'h>
{
	accept_header: Option<&'h HeaderValue>,
}

// -------------- //
// Implémentation //
// -------------- //

impl<T> HttpRequest<T>
{
	/// Accept Header
	pub fn accept(&self) -> HttpRequestHeaderAccept
	{
		HttpRequestHeaderAccept {
			accept_header: self.headers.get(ACCEPT),
		}
	}
}

impl<'h> HttpRequestHeaderAccept<'h>
{
	pub fn json(&self) -> bool
	{
		#[rustfmt::skip]
		let Some(accept) = self.accept_header else { return false };

		if accept.is_empty() {
			return false;
		}

		#[rustfmt::skip]
		let Ok(s) = accept.to_str() else { return false };

		s.contains("json")
	}
}
