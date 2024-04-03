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
	pub mod application use *;

	pub mod handlers use {
		pub mod channel_access_control_handler use *;
		pub mod channel_access_level_handler use *;
		pub mod channel_mode_handler use *;
	};

	pub mod responses use {
		pub mod channel_access_control_command_response use *;
		pub mod channel_access_control_error_response use *;
		pub mod channel_access_level_command_response use *;
		pub mod channel_settings_command_response use *;
		pub mod mode_response use *;
	};

	pub mod sessions use {
		pub mod channel_access_level_channels_session use *;
	};

	mod errors use {
		pub(super) mod err_bannedfromchan use *;
	};

	mod forms use {
		pub(super) mod channel_access_control_form use *;
		pub(super) mod channel_access_level_form use *;
		pub(super) mod channel_mode_form use *;
	};
}
