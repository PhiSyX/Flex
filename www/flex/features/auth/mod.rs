// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

flex_kernel::import! {
	pub mod feature use *;

	mod controllers {
		pub mod login_controller use *;
		pub mod logout_controller use *;
		pub mod signup_controller use *;
	};

	pub(crate) mod forms {
		pub mod login_form use *;
		pub mod signup_form use *;
	};

	mod errors {
		pub mod login_error use *;
	};

	mod middleware {
		pub mod auth_middleware use *;
		pub mod guest_middleware use *;
	};

	mod responses {
		pub mod rpl_created_account use *;
	};

	mod routes {
		pub mod api;
		pub mod web;
	};

	mod services {
		pub mod auth_service use *;
	};

	mod specs {
		pub mod owasp;
	};

	mod views {
		pub mod login_view use *;
		pub mod logout_view use *;
		pub mod signup_view use *;
	};
}
