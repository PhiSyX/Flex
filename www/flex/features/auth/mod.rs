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
	feature,
}

lexa_kernel::public_import! {
	controllers / {
		login_controller,
		logout_controller,
		signup_controller,
		users_controller,
	};

	dto / {
		user_cookie_dto,
	};

	forms / {
		login_form,
		signup_form,
	};

	errors / {
		login_error,
	};

	entities / {
		user_entity,
	};

	middleware / {
		auth_middleware,
		guest_middleware,
	};

	repositories / {
		user_repository,
	};

	responses / {
		rpl_created_account,
	};

	routes / {
		api,
		web,
	};

	services / {
		auth_service,
	};

	sessions / {
		constants,
	};

	specs / {
		owasp,
	};

	views / {
		login_view,
		signup_view,
	};
}
