// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::{html, Node, ViewInterface};

use crate::features::auth::forms::login_form::LoginFormData;
use crate::features::auth::AuthRouteID;
use crate::templates::layouts::BaseHTMLLayout;

// --------- //
// Structure //
// --------- //

#[derive(Default)]
#[derive(flex_web_framework::View)]
pub struct LoginView
{
	pub identifier: String,
	pub password: String,
	pub remember_me: bool,
	pub error_message: Option<String>,
}

// -------------- //
// Implémentation //
// -------------- //

impl LoginView
{
	pub fn with_error(mut self, error: impl ToString) -> Self
	{
		self.error_message.replace(error.to_string());
		self
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ViewInterface for LoginView
{
	type Layout = BaseHTMLLayout;
	type Metadata = Node;
	type Scripts = Node;
	type Styles = Node;
	type View = Node;

	fn title(&self) -> impl ToString
	{
		"Auth - Connexion"
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
					<h1 class="auth-heading">Connexion</h1>

					<div
						let-error:option={&self.error_message}
						class="alert alert/error [ gap=1 ]"
					>
						<div class="[ flex:full ]">{error}</div>
					</div>

					<form action={AuthRouteID::Login} method="POST">
						<div class="form-group">
							<label for="identifier">"Identifiant"</label>
							<input
								id="identifier"
								name="identifier"
								value={&self.identifier}
								placeholder="Nom d'utilisateur ou adresse e-mail"
								required
								tabindex="1"
							>
						</div>

						<div class="form-group">
							<span class="flex gap=2 space-between">
								<label for="password">"Mot de passe"</label>
								<a
									href="#"
									//href={AuthRouteID::Forget}
								>
									"Mot de passe oublié ?"
								</a>
							</span>

							<input
								id="password"
								name="password"
								type="password"
								value={&self.password}
								required
								tabindex="2"
							>
						</div>

						<div class="flex gap=2 space-between">
							<label>
								"Connexion automatique lors des prochaines sessions"
							</label>

							<span class="flex gap=1">
								<label for="yes">
									"Oui "
									<input
										id="yes"
										type="radio"
										name="remember_me"
										checked:if=self.remember_me
										value="true"
										tabindex="3"
									>
								</label>

								<label for="no">
									<input
										id="no"
										type="radio"
										name="remember_me"
										checked:if=(!self.remember_me)
										value="false"
										tabindex="4"
									>
									" Non"
								</label>
							</span>
						</div>

						<div class="form-group">
							<button class="btn-submit" type="submit" tabindex="5">
								"Se connecter"
							</button>
						</div>
					</form>

					<hr text="OU">

					<a
						href="#"
						// href={AuthRouteID::Signup}
						class="d-block btn-submit t-center"
					>
						"Aller à la page d'inscription"
					</a>
				</div>

			</div>
		}
	}
}

impl From<LoginFormData> for LoginView
{
	fn from(form: LoginFormData) -> Self
	{
		Self {
			identifier: form.identifier.to_string(),
			password: form.password,
			remember_me: form.remember_me,
			error_message: Default::default(),
		}
	}
}
