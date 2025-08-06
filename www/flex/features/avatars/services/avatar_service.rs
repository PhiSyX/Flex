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

use flex_web_framework::types::{Bytes, time};
use sqlx::types::Uuid;

use crate::features::avatars::dto::UpdateAvatarDTO;
use crate::features::users::repositories::UserRepository;

// --------- //
// Structure //
// --------- //

pub struct AvatarService<Database>
{
	pub user_repository: Arc<dyn UserRepository<Database = Database>>,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(thiserror::Error)]
#[error("\n\t{name}: {name}", name = std::any::type_name::<Self>())]
pub enum AvatarErrorService
{
	IO(#[from] tokio::io::Error),
	SQLx(#[from] sqlx::Error),
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<Database> AvatarService<Database>
{
	pub async fn upload(
		&self,
		user_id: Uuid,
		bytes: Bytes,
		content_type: &str,
	) -> Result<UpdateAvatarDTO, AvatarErrorService>
	{
		let ext = &content_type["image/".len()..];
		let name = time::Utc::now().timestamp_millis();
		let new_file = format!("{name}.{ext}");

		// NOTE: créer l'image dans un dossier temporaire
		let temp_dir = "tmp/uploads";
		let temp_file = format!("{temp_dir}/{new_file}");
		tokio::fs::create_dir_all(temp_dir).await?;
		tokio::fs::write(&temp_file, bytes).await?;

		// NOTE: supprime le répertoire des avatars de l'utilisateur et le
		// recrée.
		let user_upload_folder =
			format!("/public/avatars/{user_id}", user_id = user_id.simple(),);
		let user_upload_folder_fs =
			format!("{}{user_upload_folder}", env!("CARGO_MANIFEST_DIR"));

		// NOTE: Pas besoin de gérer l'erreur dans le cas où le répertoire
		// n'existe pas.
		_ = tokio::fs::remove_dir_all(&user_upload_folder_fs).await;
		tokio::fs::create_dir_all(&user_upload_folder_fs).await?;

		// NOTE: déplace l'image crée dans le répertoire temporaire vers le
		// répertoire public d'avatars
		let user_upload_file_fs = format!("{user_upload_folder_fs}/{new_file}");
		tokio::fs::copy(&temp_file, user_upload_file_fs).await?;
		tokio::fs::remove_file(temp_file).await?;

		let user_upload_file = format!("{user_upload_folder}/{new_file}");
		Ok(self
			.user_repository
			.update_avatar_path(&user_id, &user_upload_file)
			.await?)
	}

	pub fn shared(self) -> Arc<Self>
	{
		Arc::new(self)
	}
}

unsafe impl<D> Sync for AvatarService<D> {}
