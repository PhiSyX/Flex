// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::{html, Node, ViewLayoutInterface};

// --------- //
// Structure //
// --------- //

pub struct BaseHTMLLayout
{
	title: String,
	body: Node,
	metadata: Vec<Node>,
	styles: Vec<Node>,
	scripts: Vec<Node>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ViewLayoutInterface for BaseHTMLLayout
{
	type Metadata = Node;
	type Scripts = Node;
	type Styles = Node;
	type View = Node;

	fn new() -> Self
	{
		Self {
			title: Default::default(),
			body: Default::default(),
			metadata: Default::default(),
			styles: Default::default(),
			scripts: Default::default(),
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

	fn add_meta(&mut self, meta: Self::Metadata)
	{
		self.metadata.push(meta);
	}

	fn add_script(&mut self, script: Self::Scripts)
	{
		self.scripts.push(script);
	}

	fn add_style(&mut self, style: Self::Styles)
	{
		self.styles.push(style);
	}

	fn view(&self) -> Self::View
	{
		html!(
			<!DOCTYPE html>
			<html lang="fr" data-js="off">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width,initial-scale=1.0">
				<meta name="author" content="Mike 'PhiSyX' S.">
				<title>{ &self.title } | Flex</title>
				<link href="/public/css/style.css" rel="stylesheet">

				{ unsafe for self.metadata }
				{ unsafe for self.styles }
			</head>
			<body>
				{ unsafe &self.body }
				{ unsafe for self.scripts }
			</body>
			</html>
		)
	}
}
