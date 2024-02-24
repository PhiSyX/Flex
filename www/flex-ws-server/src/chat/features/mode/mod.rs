// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

lexa_kernel::public_using! {
	application,
}

lexa_kernel::public_using! {
	handlers / {
		channel_access_control_handler,
		channel_access_level_handler,
		channel_mode_handler,
	};

	responses / {
		channel_access_control_command_response,
		channel_access_control_error_response,
		channel_access_level_command_response,
		channel_settings_command_response,
		mode_response,
	};

	sessions / {
		channel_access_level_channels_session,
	};
}

lexa_kernel::using! {
	errors / {
		pub(super) err_bannedfromchan,
	};

	forms / {
		pub(super) channel_access_control_form,
		pub(super) channel_access_level_form,
		pub(super) channel_mode_form,
	};
}
