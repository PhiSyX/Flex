// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Interface //
// --------- //

/// Extension Session flash
pub trait SessionFlashExtension
{
	async fn flash(&self, key: impl AsRef<str>, value: impl serde::Serialize);

	async fn take<T>(&self, key: impl AsRef<str>) -> Option<T>
	where
		T: std::fmt::Debug,
		T: serde::de::DeserializeOwned;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl SessionFlashExtension for tower_sessions::Session
{
	async fn flash(&self, key: impl AsRef<str>, value: impl serde::Serialize)
	{
		_ = self.insert(key.as_ref(), value).await;
	}

	async fn take<T>(&self, key: impl AsRef<str>) -> Option<T>
	where
		T: std::fmt::Debug,
		T: serde::de::DeserializeOwned,
	{
		self.remove::<T>(key.as_ref()).await.ok().and_then(|v| v)
	}
}
