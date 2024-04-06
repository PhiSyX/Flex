// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashMap;

use tower_sessions::Session;

// --------- //
// Interface //
// --------- //

pub trait ViewInterface
{
	type Metadata: Default;
	type Scripts: Default;
	type Styles: Default;

	type Layout: ViewLayoutInterface<
		Metadata = Self::Metadata,
		Scripts  = Self::Scripts,
		Styles   = Self::Styles,
		View     = Self::View,
	>;

	type View;

	/// Données pré-définit pour la mise en page?
	fn data(&self) -> HashMap<String, String>
	{
		Default::default()
	}

	/// Les méta-données de la vue.
	///
	/// NOTE: Dans la mise en page par défaut, les méta-données sont appliquées
	/// à l'intérieur de la balise `<head> ici </head>`. Elles correspondent
	/// généralement aux balises `<meta>`.
	fn metadata(&self) -> Self::Metadata
	{
		Default::default()
	}

	/// Les scripts de la vue.
	///
	/// NOTE: Dans la mise en page par défaut, les scripts sont appliqués avant
	/// la fermeture l'intérieur de la balise `</body>`.
	fn scripts(&self) -> Self::Scripts
	{
		Default::default()
	}

	/// Les styles de la vue.
	///
	/// NOTE: Dans la mise en page par défaut, les styles sont appliqués à
	/// l'intérieur de la balise `<head> ici </head>`, après les méta-données.
	fn styles(&self) -> Self::Styles
	{
		Default::default()
	}

	/// Le titre de la vue.
	fn title(&self) -> impl ToString;

	/// L'HTML de la vue.
	fn view(&self) -> Self::View;

	/// Le rendu de la mise en page + de la vue.
	fn render(&self) -> Self::View
	{
		let mut layout = <Self::Layout>::new();

		layout.set_title(self.title());
		layout.set_body(self.view());

		layout.add_meta(self.metadata());
		layout.add_script(self.scripts());
		layout.add_style(self.styles());
		layout.set_data(self.data());

		layout.view()
	}

	/// Définit des variables d'environnement pour la mise en page?
	fn with_env(&self, key: impl ToString, value: impl ToString)
	{
		std::env::set_var(key.to_string(), value.to_string());
	}

	/// Passe la session dans la vue.
	async fn with_session(self, _: &Session) -> Self
	where
		Self: Sized,
	{
		self
	}
}

pub trait ViewLayoutInterface
{
	type Metadata: Default;
	type Scripts: Default;
	type Styles: Default;
	type View;

	/// Crée une nouvelle instance de la [mise en page](Self).
	fn new() -> Self
	where
		Self: Sized;

	/// Applique un titre au document de la mise en page.
	fn set_title(&mut self, title: impl ToString);
	/// Applique un corps à la mise en page.
	fn set_body(&mut self, body: Self::View);
	/// Applique des données pour la mise en page.
	fn set_data(&mut self, _: HashMap<String, String>) {}
	/// Ajoute une méta-données au document de la mise en page.
	fn add_meta(&mut self, meta: Self::Metadata);
	/// Ajoute un script au document de la mise en page.
	fn add_script(&mut self, script: Self::Scripts);
	/// Ajoute un style au document de la mise en page.
	fn add_style(&mut self, style: Self::Styles);

	/// L'HTML du document de la mise en page.
	fn view(&self) -> Self::View;
}
