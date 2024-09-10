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
use tracing::instrument;

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

#[derive(Clone)]
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
pub struct HttpContextError<T>
{
	request: Option<HttpRequest<T>>,
	variant: HttpContextErrorVariant,
}

pub enum HttpContextErrorVariant
{
	Extension(axum::extract::rejection::ExtensionRejection),
	Infaillible(std::convert::Infallible),
	Err(http::StatusCode, String),
	Database(sqlx::Error),
	Tokio(tokio::io::Error),
	MissingExtension,
	Session(tower_sessions::session::Error),
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

impl<T> HttpContextError<T>
{
	#[instrument(name = "HttpContextError::bad_request", skip(req))]
	pub fn bad_request(
		req: HttpRequest<T>,
		reason: impl ToString + std::fmt::Debug,
	) -> Self
	{
		Self {
			request: Some(req),
			variant: HttpContextErrorVariant::Err(
				StatusCode::BAD_REQUEST,
				reason.to_string(),
			),
		}
	}

	#[instrument(name = "HttpContextError::database", skip(req))]
	pub fn database(req: HttpRequest<T>, sqlx_err: sqlx::Error) -> Self
	{
		Self {
			request: Some(req),
			variant: HttpContextErrorVariant::Database(sqlx_err),
		}
	}

	fn infaillible(err: std::convert::Infallible) -> Self
	{
		Self {
			request: None,
			variant: HttpContextErrorVariant::Infaillible(err),
		}
	}

	pub fn internal(req: HttpRequest<T>) -> Self
	{
		Self {
			request: Some(req),
			variant: HttpContextErrorVariant::Err(
				StatusCode::INTERNAL_SERVER_ERROR,
				String::from("Un problème est survenue sur le serveur"),
			),
		}
	}

	fn missing_extension() -> Self
	{
		Self {
			request: None,
			variant: HttpContextErrorVariant::MissingExtension,
		}
	}

	pub fn not_found(req: HttpRequest<T>) -> Self
	{
		Self {
			request: Some(req),
			variant: HttpContextErrorVariant::Err(
				StatusCode::NOT_FOUND,
				String::from("Page non trouvée"),
			),
		}
	}

	pub fn unauthorized(req: HttpRequest<T>) -> Self
	{
		Self {
			request: Some(req),
			variant: HttpContextErrorVariant::Err(
				StatusCode::UNAUTHORIZED,
				String::from("Non autorisé à consulter cette ressource"),
			),
		}
	}

	#[instrument(name = "HttpContextError::unauthorized", skip(req))]
	pub fn unauthorized_with_reason(
		req: HttpRequest<T>,
		reason: impl ToString + std::fmt::Debug,
	) -> Self
	{
		Self {
			request: Some(req),
			variant: HttpContextErrorVariant::Err(
				StatusCode::UNAUTHORIZED,
				reason.to_string(),
			),
		}
	}

	#[instrument(name = "HttpContextError::tokio", skip(req))]
	pub fn tokio(req: HttpRequest<T>, io_error: tokio::io::Error) -> Self
	{
		Self {
			request: Some(req),
			variant: HttpContextErrorVariant::Tokio(io_error),
		}
	}

	#[instrument(name = "HttpContextError::with_status_code")]
	fn with_status_code(
		status_code: StatusCode,
		reason: impl ToString + std::fmt::Debug,
	) -> Self
	{
		Self {
			request: None,
			variant: HttpContextErrorVariant::Err(
				status_code,
				reason.to_string(),
			),
		}
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
		let State(extracts) =
			State::<<T as HttpContextInterface>::State>::from_request_parts(
				parts, state,
			)
			.await
			.map_err(HttpContextError::infaillible)?;

		let context: Arc<T> = T::constructor(&parts.extensions, extracts)
			.ok_or(HttpContextError::missing_extension())?
			.shared();

		// Cookie / Session
		let cookies =
			Cookies::from_request_parts(parts, state)
				.await
				.map_err(|err| {
					HttpContextError::with_status_code(err.0, err.1.to_owned())
				})?;
		let session =
			Session::from_request_parts(parts, state)
				.await
				.map_err(|err| {
					HttpContextError::with_status_code(err.0, err.1.to_owned())
				})?;

		// Request
		let InsecureClientIp(ip) =
			InsecureClientIp::from(&parts.headers, &parts.extensions)
				.expect("Adresse IP");
		let method = parts.method.clone();
		let OriginalUri(uri) = OriginalUri::from_request_parts(parts, state)
			.await
			.map_err(HttpContextError::infaillible)?;
		let RawQuery(raw_query) = RawQuery::from_request_parts(parts, state)
			.await
			.map_err(HttpContextError::infaillible)?;
		let referer = TypedHeader::<Referer>::from_request_parts(parts, state)
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

		let status_code = match self.variant {
			| HttpContextErrorVariant::Err(status, _) => status,
			| HttpContextErrorVariant::Database(ref sqlx_error) => {
				match sqlx_error {
					| sqlx::Error::RowNotFound => StatusCode::NOT_FOUND,
					| _ => StatusCode::INTERNAL_SERVER_ERROR,
				}
			}
			| _ => StatusCode::INTERNAL_SERVER_ERROR,
		};

		let title = match self.variant {
			| HttpContextErrorVariant::Err(StatusCode::UNAUTHORIZED, _) => {
				"Pour des raisons de confidentialité, vous n'êtes pas autorisé \
				 à consulter les détails de cette ressource. Seuls les \
				 utilisateurs connectés sont autorisés à le faire."
					.to_owned()
			}

			| HttpContextErrorVariant::Database(ref sqlx_error) => {
				match sqlx_error {
					| sqlx::Error::RowNotFound => {
						String::from("Page non trouvé")
					}
					| _ => {
						String::from(
							"Un problème est survenue sur le serveur (ID: \
							 n°54321)",
						)
					}
				}
			}

			| _ => {
				String::from(
					"Un problème est survenue sur le serveur  (ID: n°5000)",
				)
			}
		};

		let detail = match self.variant {
			| HttpContextErrorVariant::Err(StatusCode::UNAUTHORIZED, msg) => {
				msg
			}

			| HttpContextErrorVariant::Database(ref io_error) => {
				match io_error {
					| sqlx::Error::RowNotFound => {
						String::from("Page non trouvée")
					}
					| _ => {
						log::error!("Erreur en base de données: {io_error:?}");
						String::from("Erreur ID: n°54322")
					}
				}
			}

			| _ => self.to_string(),
		};

		if let Some(instance) = self.request {
			(
				status_code,
				headers,
				Json(json!({
					"title": title,
					"status": status_code.as_u16(),
					"detail": detail,
					"instance": instance.uri.path(),
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
		let State(extracts) =
			State::<<T as HttpContextInterface>::State>::from_request_parts(
				parts, state,
			)
			.await
			.map_err(HttpContextError::infaillible)?;

		let context: Arc<T> = T::constructor(&parts.extensions, extracts)
			.ok_or(HttpContextError::missing_extension())?
			.shared();

		// Cookie / Session
		let cookies =
			Cookies::from_request_parts(parts, state)
				.await
				.map_err(|err| {
					HttpContextError::with_status_code(err.0, err.1.to_owned())
				})?;
		let session =
			Session::from_request_parts(parts, state)
				.await
				.map_err(|err| {
					HttpContextError::with_status_code(err.0, err.1.to_owned())
				})?;

		// Request
		let InsecureClientIp(ip) =
			InsecureClientIp::from(&parts.headers, &parts.extensions)
				.expect("Adresse IP");
		let method = parts.method.clone();
		let OriginalUri(uri) = OriginalUri::from_request_parts(parts, state)
			.await
			.map_err(HttpContextError::infaillible)?;
		let RawQuery(raw_query) = RawQuery::from_request_parts(parts, state)
			.await
			.map_err(HttpContextError::infaillible)?;
		let referer = TypedHeader::<Referer>::from_request_parts(parts, state)
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
			headers: parts.headers.clone(),
		};

		// Response
		let response = HttpResponse {
			context: context.clone(),
			session: session.clone(),
		};

		let Ok(Some(current_user)) = session.get::<U>("user").await else {
			return Err(HttpContextError::unauthorized(request));
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
