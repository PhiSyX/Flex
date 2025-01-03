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

use crate::features::auth::forms::{Identifier, RegistrationFormData};
use crate::features::users::dto::{UserNewActionDTO, UserSessionDTO};
use crate::features::users::entities::UserEntity;
use crate::features::users::repositories::UserRepository;

// --------- //
// Structure //
// --------- //

pub struct AuthService<Database>
{
	pub user_repository: Arc<dyn UserRepository<Database = Database>>,
	pub password_service: Argon2Password,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(thiserror::Error)]
#[error("\n\t{name}: {name}", name = std::any::type_name::<Self>())]
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

impl<Database> AuthService<Database>
{
	/// Tentative de connexion d'un utilisateur.
	pub async fn attempt(
		&self,
		identifier: &Identifier,
		password: &str,
	) -> Result<UserSessionDTO, AuthErrorService>
	{
		// FIXME: passer un DTO en paramètre générique plutôt que de retourner
		//        directement `UserSessionDTO`. Actuellement, le système de
		//        trait async + générique ne fonctionne pas correctement dans
		//        mon cas.
		let maybe_user = match identifier {
			| Identifier::Email(email) => {
				self.user_repository.find_by_email(email).await
			}
			| Identifier::Username(username) => {
				self.user_repository.find_by_name(username).await
			}
		};

		if let Err(err) = maybe_user {
			// SECURITY: timing attacks.
			self.password_service.hash("1234567890").unwrap();
			return Err(AuthErrorService::SQLx(err));
		}

		let user = maybe_user?;

		if !self.password_service.cmp(&user.password, password) {
			// SECURITY: timing attacks.
			self.password_service.hash("1234567890").unwrap();
			return Err(AuthErrorService::InvalidPassword);
		}

		let session = UserSessionDTO {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			avatar: user.avatar,
			firstname: user.firstname,
			lastname: user.lastname,
			gender: user.gender,
			country: user.country,
			city: user.city,
		};

		Ok(session)
	}

	/// Tentative d'inscription d'un nouvel utilisateur.
	pub async fn signup(
		&self,
		mut new_user: UserNewActionDTO,
	) -> Result<UserEntity, AuthErrorService>
	{
		let user_exists = self
			.user_repository
			.find_by_email_or_name(&new_user.email_address, &new_user.username)
			.await
			.is_ok();

		if user_exists {
			// SECURITY: timing attacks.
			_ = self.password_service.hash("1234567890");
			return Err(AuthErrorService::EmailOrNameAlreadyTaken);
		}

		let exposed_password = new_user.password.expose();
		let encoded_password = self
			.password_service
			.hash(exposed_password)
			.map_err(|_| AuthErrorService::Hasher)?;
		new_user.password = secret::Secret::from(encoded_password);
		let user = self.user_repository.create(new_user).await?;

		// TODO(auth): Jeton de vérification de compte.
		// TODO(auth): Envoie de mail.

		Ok(user)
	}

	pub fn shared(self) -> Arc<Self>
	{
		Arc::new(self)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl From<RegistrationFormData> for UserNewActionDTO
{
	fn from(form: RegistrationFormData) -> Self
	{
		Self {
			username: form.username,
			email_address: email::EmailAddress::new_unchecked(
				form.email_address,
			),
			password: form.password,
			role: Default::default(),
		}
	}
}

unsafe impl<D> Sync for AuthService<D> {}
