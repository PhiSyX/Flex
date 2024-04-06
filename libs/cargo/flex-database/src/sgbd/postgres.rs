// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::time;

use sqlx::{pool, postgres};

use crate::SGBD;

// ---- //
// Type //
// ---- //

pub type PgPool = sqlx::PgPool;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct PostgresSGBD
{
	/// URL de connexion à la base de données Postgres.
	connection_url: String,

	/// Pool de connexion de la base de données Postgres
	database_pool: PgPool,
}

// -------------- //
// Implémentation //
// -------------- //

impl PostgresSGBD
{
	const MAX_IDLE: u64 = 8;
	const MAX_OPEN: u32 = 32;
	const TIMEOUT_SECONDS: u64 = 15;

	/// URL de connexion à la base de données Postgres.
	pub fn connection_url(&self) -> &str
	{
		&self.connection_url
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[async_trait::async_trait]
impl SGBD for PostgresSGBD
{
	type Pool = PgPool;

	async fn new(
		connection_url: impl AsRef<str> + ToString + Send + Sync,
	) -> Result<Self, crate::Error>
	{
		let pool = Self::create_pool(&connection_url).await?;

		Ok(Self {
			connection_url: connection_url.to_string(),
			database_pool: pool,
		})
	}

	async fn create_pool(
		url: impl AsRef<str> + Send + Sync,
	) -> Result<Self::Pool, crate::Error>
	{
		let options: pool::PoolOptions<_> = postgres::PgPoolOptions::new()
			.idle_timeout(time::Duration::from_secs(Self::MAX_IDLE))
			.max_connections(Self::MAX_OPEN)
			.acquire_timeout(time::Duration::from_secs(Self::TIMEOUT_SECONDS));
		let pool: Self::Pool = options.connect(url.as_ref()).await?;
		Ok(pool)
	}

	/// Pool de connexion de la base de données Postgres
	fn pool(&self) -> &Self::Pool
	{
		&self.database_pool
	}
}
