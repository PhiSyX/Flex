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
	pub mod application use *;

	pub mod controllers use {
		pub mod token_controller use *;
	};

	mod errors {
		pub(super) mod err_alreadyregistered use *;
	};

	pub mod handlers use {
		pub mod connect_handler use *;
		pub mod nick_handler use *;
		pub mod pass_handler use *;
		pub mod user_handler use *;
	};

	mod sessions {
		pub mod connect_clients_session use *;
	};

	pub(crate) mod forms use {
		pub(crate) mod remember_user_form use *;
		pub(super) mod token_form use *;
		pub(super) mod pass_form use *;
		pub(super) mod user_form use *;
	};

	pub(crate) mod responses use {
		pub(crate) mod connect_command_response use *;
		pub(super) mod connect_error_response use *;
		mod rpl_created use *;
		mod rpl_welcome use *;
		mod rpl_yourhost use *;
		pub(crate) mod user_command_response use *;
	};
}
