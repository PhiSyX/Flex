// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::sync::Arc;

use flex_crypto::Hasher;
use flex_web_framework::security::Argon2Password;
use flex_web_framework::types::{email, secret};

use crate::features::auth::entities::{UserEntity, UserRole};
use crate::features::auth::forms::{Identifier, RegistrationFormData};
use crate::features::auth::repositories::UserRepository;

// --------- //
// Interface //
// --------- //

#[flex_web_framework::async_trait]
pub trait AuthenticationService
{
	/// Tentative de connexion d'un utilisateur.
	async fn attempt(&self, identifier: &Identifier, password: &str) -> Result<UserEntity, AuthErrorService>;

	/// Tentative d'inscription d'un nouvel utilisateur.
	async fn signup(&self, new_user: NewUser) -> Result<UserEntity, AuthErrorService>;

	fn shared(self) -> Arc<Self>
	where
		Self: Sized,
	{
		Arc::new(self)
	}
}

// --------- //
// Structure //
// --------- //

pub struct AuthService
{
	pub user_repository: Arc<dyn UserRepository>,
	pub password_service: Argon2Password,
}

pub struct NewUser
{
	/// Nouveau nom d'utilisateur.
	pub username: String,
	/// Adresse e-mail de l'utilisateur associé à l'identifiant.
	pub email_address: email::EmailAddress,
	/// Mot de passe du compte.
	pub password: secret::Secret<String>,
	/// Rôle du nouvel utilisateur.
	pub role: UserRole,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(thiserror::Error)]
#[error("\n\t{}: {0}", std::any::type_name::<Self>())]
pub enum AuthErrorService
{
	SQLx(#[from] sqlx::Error),
	Hasher,
	InvalidPassword,
	EmailOrNameAlreadyTaken,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl AuthenticationService for AuthService
{
	async fn attempt(&self, identifier: &Identifier, password: &str) -> Result<UserEntity, AuthErrorService>
	{
		// FIXME: passer un DTO en paramètre générique plutôt que de retourner
		//        directement l'entité `UserEntity`. Actuellement, le système de
		//        trait async + générique ne fonctionne pas correctement dans
		//        mon cas.
		let maybe_user = match identifier {
			| Identifier::Email(email) => self.user_repository.find_by_email(email).await,
			| Identifier::Username(username) => self.user_repository.find_by_name(username).await,
		};

		if let Err(err) = maybe_user {
			// SECURITY: timing attacks.
			self.password_service.encrypt("1234567890").unwrap();
			return Err(AuthErrorService::SQLx(err));
		}

		let user = maybe_user?;
		if !self.password_service.cmp(&user.password, password) {
			return Err(AuthErrorService::InvalidPassword);
		}

		Ok(user)
	}

	async fn signup(&self, mut new_user: NewUser) -> Result<UserEntity, AuthErrorService>
	{
		let user_exists = self.user_repository
			.find_by_email_or_name(&new_user.email_address, &new_user.username).await
			.is_ok()
		;

		if user_exists {
			// SECURITY: timing attacks.
			_ = self.password_service.encrypt("1234567890");
			return Err(AuthErrorService::EmailOrNameAlreadyTaken);
		}

		let encoded_password = self.password_service
			.encrypt(new_user.password.expose())
			.map_err(|_| AuthErrorService::Hasher)?
		;
		new_user.password = secret::Secret::from(encoded_password);
		let user = self.user_repository.create(new_user).await?;

		// TODO(auth): Jeton de vérification de compte.
		// TODO(auth): Envoie de mail.

		Ok(user)
	}
}

unsafe impl Sync for AuthService {}

impl From<RegistrationFormData> for NewUser
{
	fn from(form: RegistrationFormData) -> Self
	{
		Self {
			username: form.username,
			email_address: form.email_address,
			password: form.password,
			role: Default::default(),
		}
	}
}
