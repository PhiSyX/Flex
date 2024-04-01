// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use hyper::http;

// --------- //
// Structure //
// --------- //

pub struct Form<F>(pub F);

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

	async fn from_request(req: axum::extract::Request, state: &S) -> Result<Self, Self::Rejection>
	{
		use axum::extract::{Json, Form};

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
		let err_status = http::StatusCode::INTERNAL_SERVER_ERROR;
		let err_body = self.to_string();
		(err_status, err_body).into_response()
	}
}

fn json_content_type(headers: &hyper::HeaderMap) -> bool
{
	let Some(content_type) = headers.get(hyper::header::CONTENT_TYPE) else { return false; };
	let Ok(content_type) = content_type.to_str() else { return false; };
	let Ok(mime) = content_type.parse::<mime::Mime>() else { return false; };

	let is_json_content_type = mime.type_() == "application" && (
		mime.subtype() == "json" ||mime.suffix().map_or(false, |name| name == "json")
	);

	is_json_content_type
}
