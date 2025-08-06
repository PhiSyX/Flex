// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::{Node, ViewInterface, html};

use crate::features::auth::routes::web::AuthRouteID;
use crate::features::users::dto::UserSessionDTO;
use crate::templates::layouts::BaseHTMLLayout;

// --------- //
// Structure //
// --------- //

#[derive(flex_web_framework::View)]
pub struct LogoutView
{
	pub user_session: UserSessionDTO,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ViewInterface for LogoutView
{
	type Layout = BaseHTMLLayout;
	type Metadata = Node;
	type Scripts = Node;
	type Styles = Node;
	type View = Node;

	fn title(&self) -> impl ToString
	{
		"Auth - Déconnexion"
	}

	fn styles(&self) -> Self::Styles
	{
		html! {
			<link href="/public/css/auth.css" rel="stylesheet">
		}
	}

	fn view(&self) -> Self::View
	{
		html! {
			<div id="no-auth-intro">
				<div class="auth-container">
					<p>
						Connecté en tant que
						<strong>{&self.user_session.name}</strong>
						<em>" (" { &self.user_session.email } ")"</em>
					</p>

					<form action={AuthRouteID::Logout} method="DELETE">
						<input type="hidden" value={&self.user_session.name} />

						<div class="form-group">
							<button class="btn-submit" type="submit">
								Se déconnecter maintenant
							</button>
						</div>
					</form>
				</div>
			</div>
		}
	}
}
