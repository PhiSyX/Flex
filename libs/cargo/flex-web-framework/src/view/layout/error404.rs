// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework_macro::html;

use crate::{Node, ViewInterface, ViewLayoutInterface};

// --------- //
// Structure //
// --------- //

/// Mise en page HTML d'une erreur 404.
pub struct Error404HTMLLayout
{
	body: Node,
	title: String,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ViewLayoutInterface for Error404HTMLLayout
{
	type Metadata = Node;
	type Scripts = Node;
	type Styles = Node;
	type View = Node;

	fn new() -> Self
	{
		Self {
			body: Default::default(),
			title: Default::default(),
		}
	}

	fn set_title(&mut self, title: impl ToString)
	{
		self.title = title.to_string();
	}

	fn set_body(&mut self, body: Self::View)
	{
		self.body = body;
	}

	fn set_data(&mut self, _: std::collections::HashMap<String, String>) {}

	fn add_meta(&mut self, _: Self::Metadata) {}

	fn add_script(&mut self, _: Self::Scripts) {}

	fn add_style(&mut self, _: Self::Styles) {}

	fn view(&self) -> Self::View
	{
		html!(
			<!DOCTYPE html>
			<html lang="fr">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width,initial-scale=1.0">
				<title>{ &self.title }</title>
			</head>
			<body>
				<h1>Page not found</h1>
				{ unsafe &self.body }
			</body>
			</html>
		)
	}
}

// --------- //
// Structure //
// --------- //

pub struct Error404HTMLView
{
	pub method: String,
	pub uri: hyper::Uri,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ViewInterface for Error404HTMLView
{
	type Layout = Error404HTMLLayout;
	type Metadata = Node;
	type Scripts = Node;
	type Styles = Node;
	type View = Node;

	fn title(&self) -> impl ToString
	{
		"Page non trouvée - Erreur 404"
	}

	fn view(&self) -> Self::View
	{
		crate::html!(
			<strong>"[" {&self.method} "]"</strong>: <em>{&self.uri}</em>
			<p>"La page demandée n'existe pas."</p>
		)
	}
}

impl crate::http::IntoResponse for Error404HTMLView
{
	fn into_response(self) -> crate::http::Response
	{
		use crate::ViewInterface;
		crate::http::response::Html(self.render().to_string()).into_response()
	}
}
impl From<Error404HTMLView> for crate::http::Body
{
	fn from(v: Error404HTMLView) -> Self
	{
		use crate::ViewInterface;
		Self::new(v.render().to_string())
	}
}
