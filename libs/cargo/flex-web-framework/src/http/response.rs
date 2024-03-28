// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::sync::Arc;

pub use axum::response::*;
use tower_sessions::Session;

// --------- //
// Structure //
// --------- //

pub struct HttpResponse<T>
{
	pub(crate) context: Arc<T>,
	pub(crate) session: Session,
}

// -------------- //
// Implémentation //
// -------------- //

impl<T> HttpResponse<T>
{
	/// Rend l'HTML.
	#[inline]
	pub fn html<R>(&self, html: impl Into<Html<R>>) -> Html<R>
	where
		R: Into<Html<R>>,
	{
		html.into()
	}

	/// Rend l'html d'une vue (ViewInterface).
	///
	/// La session est incluse dans la vue via la méthode `with_session`.
	pub async fn render<V>(&self, view: V) -> Html<V>
	where
		V: crate::ViewInterface,
	{
		Html(view.with_session(&self.session).await)
	}

	/// Retourne un JSON en réponse.
	//
	// BUG(phisyx): provoque une erreur avec la commande `cargo doc`.
	// ISSUE(rust): "rustdoc RPITIT ICE:
	//               compiler\rustc_middle\src\ty\generic_args.rs:900:9: type
	//               parameter impl ToString/#1 (impl ToString/1) out of range
	//               when substituting, args=[MyStruct] "
	//               https://github.com/rust-lang/rust/issues/113929
	// ISSUE(rust): Closed (Fixed by https://github.com/rust-lang/rust/pull/113956).
	#[inline]
	pub fn json<D>(&self, data: D) -> axum::response::Json<D>
	where
		D: serde::Serialize,
	{
		// axum::response::Json(serde_json::json!(data))
		data.into()
	}

	/// Redirige le client vers une URL (Code HTTP 303).
	#[inline]
	pub fn redirect_to(&self, uri: impl ToString) -> axum::response::Redirect
	where
		Self: Sized,
	{
		axum::response::Redirect::to(uri.to_string().as_ref())
	}

	/// Redirige le client vers une URL de manière permanente (Code HTTP 308).
	#[inline]
	pub fn redirect_permanent(&self, uri: impl ToString) -> axum::response::Redirect
	where
		Self: Sized,
	{
		axum::response::Redirect::permanent(uri.to_string().as_ref())
	}

	/// Redirige le client vers une URL de manière temporaire (Code HTTP 307).
	#[inline]
	pub fn redirect_temporary(&self, uri: impl ToString) -> axum::response::Redirect
	where
		Self: Sized,
	{
		axum::response::Redirect::temporary(uri.to_string().as_ref())
	}
}
