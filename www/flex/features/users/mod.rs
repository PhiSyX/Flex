// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

lexa_kernel::import! {
	pub mod feature use *;

	mod controllers {
		pub mod api {
			pub mod v1 {
				pub mod users_controller use *;
			}
		}
	};

	// NOTE(vis): les autres features pourraient avoir besoin de ces éléments
	pub(crate) mod dto {
		pub mod user_new_action_dto use *;
		pub mod user_session_dto use *;
	};

	// NOTE(vis): les autres features pourraient avoir besoin de ces éléments
	pub(crate) mod entities {
		pub mod user_entity use *;
	};

	// NOTE(vis): les autres features pourraient avoir besoin de ces éléments
	pub(crate) mod repositories {
		pub mod user_repository use *;
	};

	mod routes {
		pub mod api;
	};

	pub(crate) mod sessions {
		pub mod constant;
	};
}
