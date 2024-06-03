// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod cookie;
mod cors;
mod server;

use std::sync::Arc;

pub use self::cookie::{
	Settings as CookieSettings,
	SettingsSameSite as CookieSettingsSameSite,
};
pub use self::cors::Settings as CORSSettings;
pub use self::server::Settings as ServerSettings;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Default)]
#[derive(Clone)]
#[derive(serde::Deserialize)]
pub struct Config<UserConfig>
where
	UserConfig: crate::FeatureConfig,
{
	pub cors: Option<CORSSettings>,
	pub cookie: Option<CookieSettings>,
	// pub database: Option<DatabaseSettings>,
	#[serde(bound(deserialize = ""))]
	#[serde(flatten)]
	pub user: UserConfig,
}

// -------------- //
// Implémentation //
// -------------- //

impl<U> Config<U>
where
	U: crate::FeatureConfig,
{
	pub fn shared_user(&self) -> Arc<U>
	{
		Arc::new(self.user.clone())
	}
}
