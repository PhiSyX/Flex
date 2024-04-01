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

use axum::extract::*;
use axum::http::{self, Extensions, HeaderValue};
use axum_client_ip::InsecureClientIp;
use axum_extra::headers::Referer;
use hyper::{header, HeaderMap, StatusCode};
use serde_json::json;
use tower_sessions::Session;

use super::request::HttpRequest;
use super::response::HttpResponse;
use super::Cookies;
use crate::AxumState;

// --------- //
// Interface //
// --------- //

pub trait HttpContextInterface: Send + Sync
{
	type State;

	fn constructor(extensions: &Extensions, state: Self::State) -> Option<Self>
		where
			Self: Sized;

	fn shared(self) -> Arc<Self> where Self: Sized,
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
	pub cookies: Cookies,
	pub session: Session,
}

pub struct HttpAuthContext<T, U>
{
	pub(crate) context: Arc<T>,
	pub request: HttpRequest<T>,
	pub response: HttpResponse<T>,
	pub cookies: Cookies,
	pub session: Session,
	pub user: U,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(thiserror::Error)]
#[error("\n\t{}: {0}", std::any::type_name::<Self>())]
pub enum HttpContextError<T>
{
	Extension(#[from] axum::extract::rejection::ExtensionRejection),
	Infaillible(#[from] std::convert::Infallible),
	#[error("{}", err.1)]
	StaticErr {
		err: (http::StatusCode, &'static str),
	},
	MissingExtension,
	Unauthorized
	{
		request: HttpRequest<T>,
	},
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

impl<T, U> HttpAuthContext<T, U>
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
impl<T, S> FromRequestParts<AxumState<S>> for HttpContext<T>
where
	T: 'static,
	T: HttpContextInterface,
	S: 'static,
	S: Send + Sync,
	<T as HttpContextInterface>::State: Send + Sync,
	<T as HttpContextInterface>::State: FromRef<AxumState<S>>,
{
	type Rejection = HttpContextError<T>;

	async fn from_request_parts(
		parts: &mut axum::http::request::Parts,
		state: &AxumState<S>,
	) -> Result<Self, Self::Rejection>
	{
		use axum_extra::TypedHeader;

		// Context
		let State(extracts) = State::<<T as HttpContextInterface>::State>::from_request_parts(
			parts,
			state
		).await?;

		let context: Arc<T> = T::constructor(&parts.extensions, extracts)
			.ok_or(HttpContextError::MissingExtension)?
			.shared();

		// Cookie / Session
		let cookies = Cookies::from_request_parts(parts, state)
			.await
			.map_err(|err| HttpContextError::StaticErr { err })?;
		let session = Session::from_request_parts(parts, state)
			.await
			.map_err(|err| HttpContextError::StaticErr { err })?;

		// Request
		let InsecureClientIp(ip) = InsecureClientIp::from(&parts.headers, &parts.extensions)
			.expect("Adresse IP");
		let method = parts.method.clone();
		let OriginalUri(uri) = OriginalUri::from_request_parts(parts, state).await?;
		let RawQuery(raw_query) = RawQuery::from_request_parts(parts, state).await?;
		let referer = TypedHeader::<Referer>::from_request_parts(parts, state).await
			.map(|ext| ext.0)
			.ok();

		let request = HttpRequest {
			context: context.clone(),
			ip,
			method,
			uri,
			raw_query,
			referer,
			headers: parts.headers.clone(),
		};

		// Response
		let response = HttpResponse {
			context: context.clone(),
			session: session.clone(),
		};

		Ok(Self {
			context,
			request,
			response,
			cookies,
			session,
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

impl<T> axum::response::IntoResponse for HttpContextError<T>
{
	fn into_response(self) -> axum::response::Response
	{
		let mut headers = HeaderMap::new();

		headers.insert(
			header::CONTENT_TYPE,
			HeaderValue::from_str("application/problem+json").unwrap(),
		);

		let status_code = match self {
			| Self::Unauthorized { .. } => StatusCode::UNAUTHORIZED,
			| _ => StatusCode::INTERNAL_SERVER_ERROR,
		};

		let title = match self {
			| Self::Unauthorized { .. } => "Non autorisé à consulter cette ressource",
			| _ => "Un problème est survenue sur le serveur",
		};

		let detail = match self {
			| Self::Unauthorized { .. } => {
				"Pour des raisons de confidentialité, vous n'êtes pas autorisé à consulter les \
				 détails de cette ressource. Seuls les utilisateurs connectés sont autorisés à le \
				 faire."
					.to_owned()
			}
			| _ => self.to_string(),
		};

		let instance = match self {
			| Self::Unauthorized { ref request } => Some(request.uri.path()),
			| _ => None,
		};

		if let Some(instance) = instance {
			(
				status_code,
				headers,
				Json(json!({
					"title": title,
					"status": status_code.as_u16(),
					"detail": detail,
					"instance": instance,
				})),
			)
		} else {
			(
				status_code,
				headers,
				Json(json!({
					"title": title,
					"status": status_code.as_u16(),
					"detail": detail,
				})),
			)
		}
		.into_response()
	}
}

#[axum::async_trait]
impl<T, U, S> FromRequestParts<AxumState<S>> for HttpAuthContext<T, U>
where
	T: 'static,
	T: HttpContextInterface,
	U: serde::de::DeserializeOwned,
	S: 'static,
	S: Send + Sync,
	<T as HttpContextInterface>::State: Send + Sync,
	<T as HttpContextInterface>::State: FromRef<AxumState<S>>,
{
	type Rejection = HttpContextError<T>;

	async fn from_request_parts(
		parts: &mut axum::http::request::Parts,
		state: &AxumState<S>,
	) -> Result<Self, Self::Rejection>
	{
		use axum_extra::TypedHeader;

		// Context
		let State(extracts) = State::<<T as HttpContextInterface>::State>::from_request_parts(
			parts,
			state
		).await?;

		let context: Arc<T> = T::constructor(&parts.extensions, extracts)
			.ok_or(HttpContextError::MissingExtension)?
			.shared();

		// Cookie / Session
		let cookies = Cookies::from_request_parts(parts, state)
			.await
			.map_err(|err| HttpContextError::StaticErr { err })?;
		let session = Session::from_request_parts(parts, state)
			.await
			.map_err(|err| HttpContextError::StaticErr { err })?;

		// Request
		let InsecureClientIp(ip) = InsecureClientIp::from(&parts.headers, &parts.extensions)
			.expect("Adresse IP");
		let method = parts.method.clone();
		let OriginalUri(uri) = OriginalUri::from_request_parts(parts, state).await?;
		let RawQuery(raw_query) = RawQuery::from_request_parts(parts, state).await?;
		let referer = TypedHeader::<Referer>::from_request_parts(parts, state).await
			.map(|ext| ext.0)
			.ok();

		let request = HttpRequest {
			context: context.clone(),
			ip,
			method,
			uri,
			raw_query,
			referer,
			headers: parts.headers.clone(),
		};

		// Response
		let response = HttpResponse {
			context: context.clone(),
			session: session.clone(),
		};

		let Ok(Some(current_user)) = session.get::<U>("user").await else {
			return Err(HttpContextError::Unauthorized { request });
		};

		Ok(Self {
			context,
			request,
			response,
			cookies,
			session,
			user: current_user,
		})
	}
}

impl<T, U> ops::Deref for HttpAuthContext<T, U>
{
	type Target = Arc<T>;

	fn deref(&self) -> &Self::Target
	{
		&self.context
	}
}
