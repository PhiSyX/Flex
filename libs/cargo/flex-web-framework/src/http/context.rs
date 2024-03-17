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
use std::sync::Arc;

use axum::http::Extensions;
use axum_client_ip::InsecureClientIp;
use axum_extra::headers::Referer;

use super::request::HttpRequest;
use super::response::HttpResponse;
use crate::AxumState;

// --------- //
// Interface //
// --------- //

#[axum::async_trait]
pub trait HttpContextInterface: Send + Sync
{
	type State;

	fn constructor(extensions: &Extensions, state: Self::State) -> Result<Self, HttpContextError>
	where
		Self: Sized;

	fn shared(self) -> Arc<Self>
	where
		Self: Sized,
	{
		Arc::new(self)
	}
}

// --------- //
// Structure //
// --------- //

pub struct HttpContext<T>
{
	pub(crate) context: Arc<T>,
	pub request: HttpRequest<T>,
	pub response: HttpResponse<T>,
	// pub cookies: super::cookies::Cookies,
	// pub session: super::session::Session,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(thiserror::Error)]
#[error("\n\t{}: {0}", std::any::type_name::<Self>())]
pub enum HttpContextError
{
	Extension(#[from] axum::extract::rejection::ExtensionRejection),
	Infaillible(#[from] std::convert::Infallible),
	MissingExtension,
}

// -------------- //
// Implémentation //
// -------------- //

impl<T> HttpContext<T>
{
	/// Redirige le client sur l'URL précédente. (Se basant sur l'en-tête HTTP
	/// `Referer`).
	pub fn redirect_back(&self) -> axum::response::Redirect
	{
		assert!(self.request.referer.is_some());
		let referer = self.request.referer.as_ref().expect("Referer");

		fn referer_url(referer: &Referer) -> String
		{
			let referer_s = format!("{referer:?}");

			let trimmed_referer = referer_s
				.trim_start_matches("Referer(\"")
				.trim_end_matches("\")");

			trimmed_referer.to_owned()
		}

		let uri = referer_url(referer);

		self.response.redirect_to(uri)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[axum::async_trait]
impl<T, S> axum::extract::FromRequestParts<AxumState<S>> for HttpContext<T>
where
	T: 'static,
	T: HttpContextInterface,
	S: 'static,
	S: Send + Sync,
	<T as HttpContextInterface>::State: Send + Sync,
	<T as HttpContextInterface>::State: axum::extract::FromRef<AxumState<S>>,
{
	type Rejection = HttpContextError;

	async fn from_request_parts(
		parts: &mut axum::http::request::Parts,
		state: &AxumState<S>,
	) -> Result<Self, Self::Rejection>
	{
		// Context
		let axum::extract::State(extracts) = axum::extract::State::<
			<T as HttpContextInterface>::State,
		>::from_request_parts(parts, state)
		.await?;

		let context: Arc<T> = T::constructor(&parts.extensions, extracts)?.shared();

		// Request
		let InsecureClientIp(ip) =
			InsecureClientIp::from(&parts.headers, &parts.extensions).expect("Adresse IP");
		let method = parts.method.clone();
		let axum::extract::OriginalUri(uri) =
			axum::extract::OriginalUri::from_request_parts(parts, state).await?;
		let axum::extract::RawQuery(raw_query) =
			axum::extract::RawQuery::from_request_parts(parts, state).await?;
		let referer = axum_extra::TypedHeader::<Referer>::from_request_parts(parts, state)
			.await
			.map(|ext| ext.0)
			.ok();
		let request = HttpRequest {
			context: context.clone(),
			ip,
			method,
			uri,
			raw_query,
			referer,
		};

		// Response
		let response = HttpResponse {
			context: context.clone(),
		};

		Ok(Self {
			context,
			request,
			response,
		})
	}
}

impl<T> ops::Deref for HttpContext<T>
{
	type Target = Arc<T>;

	fn deref(&self) -> &Self::Target
	{
		&self.context
	}
}

impl axum::response::IntoResponse for HttpContextError
{
	fn into_response(self) -> axum::response::Response
	{
		let err_status = hyper::StatusCode::INTERNAL_SERVER_ERROR;
		let err_body = self.to_string();
		(err_status, err_body).into_response()
	}
}
