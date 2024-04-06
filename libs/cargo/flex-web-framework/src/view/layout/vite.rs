// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashMap;

use flex_web_framework_macro::html;

use crate::{Node, ViewLayoutInterface};

// --------- //
// Structure //
// --------- //

pub struct ViteLayout
{
	title: String,
	data: HashMap<String, String>,
	body: Node,
	metadata: Vec<Node>,
	styles: Vec<Node>,
	scripts: Vec<Node>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ViewLayoutInterface for ViteLayout
{
	type Metadata = Node;
	type Scripts = Node;
	type Styles = Node;
	type View = Node;

	fn new() -> Self
	{
		Self {
			title: Default::default(),
			data: Default::default(),
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

	fn set_data(&mut self, data: HashMap<String, String>)
	{
		self.data = data;
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
		let vite_url = self.data.get("vite_url").cloned().unwrap_or_default();
		let vite_root = self.data.get("vite_root").cloned().unwrap_or("app".into());

		let vite_script = format!(
			"<script type='module' src='{}/@vite/client'></script>",
			&vite_url
		);
		let vite_user_script = format!(
			"<script type='module' src='{}/src/main.ts'></script>",
			&vite_url
		);

		html!(
			<!DOCTYPE html>
			<html lang="fr">
			<head>
				{ unsafe vite_script }
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width,initial-scale=1.0">
				<title>{ &self.title }</title>

				{ unsafe for self.metadata }
				{ unsafe for self.styles }
			</head>
			<body>
				<div id={vite_root}>
					{ unsafe &self.body }
				</div>

				{ unsafe vite_user_script }
				{ unsafe for self.scripts }
			</body>
			</html>
		)
	}
}
