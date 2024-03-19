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

use crate::features::auth::entities::user_entity::UserEntity;
use crate::features::auth::forms::login_form::Identifier;
use crate::features::auth::repositories::user_repository::UserRepository;

// --------- //
// Interface //
// --------- //

#[flex_web_framework::async_trait]
pub trait AuthenticationService
{
	async fn attempt(
		&self,
		identifier: &Identifier,
		password: &str,
	) -> Result<UserEntity, AuthErrorService>;

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

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(thiserror::Error)]
#[error("\n\t{}: {0}", std::any::type_name::<Self>())]
pub enum AuthErrorService
{
	InvalidPassword,
	UserNotFound,
}

// -------------- //
// Implémentation //
// -------------- //

impl AuthService {}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl AuthenticationService for AuthService
{
	async fn attempt(
		&self,
		identifier: &Identifier,
		password: &str,
	) -> Result<UserEntity, AuthErrorService>
	{
		// FIXME: passer un DTO en paramètre générique plutôt que de retourner
		//        directement l'entité `UserEntity`. Actuellement, le système de
		//        trait async + générique ne fonctionne pas correctement dans
		//        mon cas.
		let maybe_user = match identifier {
			| Identifier::Email(email) => self.user_repository.find_by_email(email).await,
			| Identifier::Username(username) => self.user_repository.find_by_name(username).await,
		};

		let user = match maybe_user {
			| Ok(user) => user,
			| Err(err) => {
				tracing::error!(
					?err,
					"Erreur lors de la récupération de l'utilisateur dans la base de données"
				);
				// SECURITY: timing attacks.
				self.password_service.encrypt("1234567890").unwrap();
				return Err(AuthErrorService::UserNotFound);
			}
		};

		if !self.password_service.cmp(&user.password, password) {
			return Err(AuthErrorService::InvalidPassword);
		}

		Ok(user)
	}
}

unsafe impl Sync for AuthService {}
