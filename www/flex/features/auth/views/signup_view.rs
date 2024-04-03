// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::view::Node;
use flex_web_framework::{html, ViewInterface};

use crate::features::auth::forms::RegistrationFormData;
use crate::features::auth::routes::web::AuthRouteID;
use crate::templates::layouts::BaseHTMLLayout;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Default)]
#[derive(flex_web_framework::View)]
pub struct SignupView
{
	pub username: String,
	pub email_address: String,
	pub password: String,
	pub password_confirmation: String,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ViewInterface for SignupView
{
	type Layout = BaseHTMLLayout;
	type Metadata = Node;
	type Scripts = Node;
	type Styles = Node;
	type View = Node;

	fn styles(&self) -> Self::Styles
	{
		html! {
			<link href="/public/css/auth.css" rel="stylesheet">
		}
	}

	fn title(&self) -> impl ToString
	{
		"Auth - Inscription"
	}

	fn view(&self) -> Self::View
	{
		html! {
			<div id="no-auth-intro">
				<div class="auth-container">
					<h1 class="auth-heading">Inscription</h1>

					<form action={AuthRouteID::Signup} method="POST">
						<div class="form-group">
							<label for="username">"Nom d'utilisateur"</label>
							<input id="username" name="username" value={&self.username} required>
						</div>

						<div class="form-group">
							<label for="email_address">"Adresse e-mail"</label>
							<input
								id="email_address"
								name="email_address"
								type="email"
								value={&self.email_address}
								placeholder="john.doe@example.org"
								required
							/>
						</div>

						<div class="*md:d-flex! md*:d-flex gap=2 items-end">
							<div class="form-group">
								<label for="password">"Mot de passe"</label>
								<input
									id="password"
									name="password"
									type="password"
									value={&self.password}
									required
								>
							</div>

							<div class="form-group">
								<label for="password_confirmation">
									"Confirmer le mot de passe"
								</label>
								<input
									id="password_confirmation"
									name="password_confirmation"
									type="password"
									value={&self.password_confirmation}
									required
								>
							</div>
						</div>

						<div class="form-group">
							<button class="btn-submit" type="submit">
								"S'inscrire"
							</button>
						</div>
					</form>

					<hr text="OU" />

					<a
						href={AuthRouteID::Login}
						class="d-block btn-submit t-center"
					>
						"Aller à la page de connexion"
					</a>
				</div>

			</div>
		}
	}
}

impl From<RegistrationFormData> for SignupView
{
	fn from(form: RegistrationFormData) -> Self
	{
		Self {
			username: form.username,
			email_address: form.email_address.to_string(),
			password: String::from(form.password.expose()),
			password_confirmation: String::from(form.password_confirmation.expose()),
		}
	}
}
