// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::Feature;

use super::routes::{web::AuthRouter, api::AuthApi_V1_Router};
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct AuthApplication;

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Feature for AuthApplication
{
	type Config = ();
	type Router = (
		AuthRouter,
		AuthApi_V1_Router,
	);
	type State = FlexState;

	const NAME: &'static str = "AuthApplication";

	fn register_services(
		_config: &flex_web_framework::settings::Config<Self::Config>,
		axum_state: &mut flex_web_framework::AxumState<Self::State>,
		router: flex_web_framework::AxumRouter<Self::State>,
	) -> flex_web_framework::AxumRouter<Self::State>
	{
		axum_state.set_state(FlexState::Auth);
		router
	}
}
