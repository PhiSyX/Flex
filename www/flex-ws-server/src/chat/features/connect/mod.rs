// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

lexa_kernel::using! {
	pub application,
}

lexa_kernel::public_using! {
	controllers / {
		token_controller,
	};

	handlers / {
		connect_handler,
		nick_handler,
		pass_handler,
		user_handler,
	};

	sessions / {
		connect_clients_session,
	};
}

lexa_kernel::using! {
	errors / {
		pub(super) err_alreadyregistered,
	};

	pub(in crate::features::chat) forms / {
		pub(in crate::features::chat) remember_user_form,
		pub(super) token_form,
		pub(super) pass_form,
		pub(super) user_form,
	};

	pub(in crate::src::chat::features) responses / {
		pub(super) connect_command_response,
		pub(super) connect_error_response,
		rpl_created,
		rpl_welcome,
		rpl_yourhost,
		pub(in crate::src::chat::features) user_command_response,
	};
}
