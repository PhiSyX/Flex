// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::http::{Extensions, HttpAuthContext, HttpContextInterface, IntoResponse};

use crate::features::auth::dto::UserCookieDTO;
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct UsersController {}

// -------------- //
// Implémentation //
// -------------- //

impl UsersController
{
	/// Utilisateur connecté en session.
	pub async fn current_user(http: HttpAuthContext<Self, UserCookieDTO>) -> impl IntoResponse
	{
		http.response.json(http.user)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl HttpContextInterface for UsersController
{
	type State = FlexState;

	fn constructor(_: &Extensions, _: Self::State) -> Option<Self>
	{
		Some(Self {})
	}
}

unsafe impl Send for UsersController {}
unsafe impl Sync for UsersController {}
