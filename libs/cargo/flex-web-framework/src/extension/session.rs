// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use tower_sessions::Session;

// --------- //
// Interface //
// --------- //

/// Extension Session flash
#[allow(async_fn_in_trait)]
pub trait SessionFlashExtension: Sized
{
	async fn flash(&self, key: impl AsRef<str>, value: impl serde::Serialize);

	async fn take<T>(&self, key: impl AsRef<str>) -> Option<T>
	where
		T: serde::de::DeserializeOwned + std::fmt::Debug;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl SessionFlashExtension for Session
{
	async fn flash(&self, key: impl AsRef<str>, value: impl serde::Serialize)
	{
		_ = self.insert(key.as_ref(), value).await;
	}

	async fn take<T>(&self, key: impl AsRef<str>) -> Option<T>
	where
		T: serde::de::DeserializeOwned + std::fmt::Debug,
	{
		self.remove::<T>(key.as_ref()).await.ok().and_then(|v| v)
	}
}
