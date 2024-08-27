// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use axum::http::HeaderValue;
use axum::Json;
use hyper::{header, HeaderMap};

pub use axum::extract::Multipart;

// --------- //
// Structure //
// --------- //

pub struct Form<F>(pub F);

#[derive(serde::Serialize, serde::Deserialize)]
struct ProblemError<'a>
{
	title: &'a str,
	status: u16,
	#[serde(skip_serializing_if = "Vec::is_empty")]
	errors: Vec<ProblemChildrenError>,
	#[serde(skip_serializing_if = "Option::is_none")]
	detail: Option<&'a str>,
}

#[derive(serde::Serialize, serde::Deserialize)]
struct ProblemChildrenError
{
	#[serde(rename = "type", skip_serializing_if = "Option::is_none")]
	ty: Option<String>,
	detail: String,
	pointer: String,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(thiserror::Error)]
#[error("\n\t{}: {0}", std::any::type_name::<Self>())]
pub enum MissingFormError
{
	FormRejection(#[from] axum::extract::rejection::FormRejection),
	JsonRejection(#[from] axum::extract::rejection::JsonRejection),
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[axum::async_trait]
impl<F, S> axum::extract::FromRequest<S> for Form<F>
where
	F: serde::de::DeserializeOwned,
	S: Send + Sync,
{
	type Rejection = MissingFormError;

	async fn from_request(
		req: axum::extract::Request,
		state: &S,
	) -> Result<Self, Self::Rejection>
	{
		use axum::extract::{Form, Json};

		let f = if json_content_type(req.headers()) {
			let Json(form) = Json::<F>::from_request(req, state).await?;
			form
		} else {
			let Form(form) = Form::<F>::from_request(req, state).await?;
			form
		};
		Ok(Self(f))
	}
}

impl axum::response::IntoResponse for MissingFormError
{
	fn into_response(self) -> axum::response::Response
	{
		let mut headers = HeaderMap::new();

		headers.insert(
			header::CONTENT_TYPE,
			HeaderValue::from_str("application/problem+json").unwrap(),
		);

		let status_code = match self {
			| Self::FormRejection(ref r) => r.status(),
			| Self::JsonRejection(ref r) => r.status(),
		};

		let title = "Échec de la dé-sérialisation du corps de la requête";

		let detail = match self {
			| Self::FormRejection(ref r) => r.body_text(),
			| Self::JsonRejection(ref r) => r.body_text(),
		};

		let ss = "Failed to deserialize the JSON body into the target type: ";
		let err_body = detail.trim_start_matches(ss);

		let errors: Result<Vec<ProblemChildrenError>, _> =
			serde_json::from_str(err_body);

		if let Ok(problem) = errors {
			let problem_s = ProblemError {
				title,
				status: status_code.as_u16(),
				errors: problem,
				detail: Default::default(),
			};
			(status_code, headers, Json(problem_s))
		} else {
			let problem_s = ProblemError {
				title,
				status: status_code.as_u16(),
				errors: Default::default(),
				detail: Some(err_body),
			};
			(status_code, headers, Json(problem_s))
		}
		.into_response()
	}
}

fn json_content_type(headers: &hyper::HeaderMap) -> bool
{
	let Some(content_type) = headers.get(hyper::header::CONTENT_TYPE) else {
		return false;
	};
	let Ok(content_type) = content_type.to_str() else {
		return false;
	};
	let Ok(mime) = content_type.parse::<mime::Mime>() else {
		return false;
	};

	#[rustfmt::skip]
	let is_json_content_type = mime.type_() == "application" && (
		mime.subtype() == "json" ||
		mime.suffix().map_or(false, |name| name == "json")
	);

	is_json_content_type
}
