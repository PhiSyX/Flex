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

mod controllers
{
	lexa_kernel::public_using! {
		login_controller,
		logout_controller,
		signup_controller,
	}
}

mod forms
{
	lexa_kernel::public_using! {
		login_form,
		signup_form,
	}
}

mod errors
{
	lexa_kernel::public_using! {
		login_error,
	}
}

mod middleware
{
	lexa_kernel::public_using! {
		auth_middleware,
		guest_middleware,
	}
}

mod responses
{
	lexa_kernel::public_using! {
		rpl_created_account,
	}
}

mod routes
{
	lexa_kernel::public_using! {
		web,
	}
}

mod services
{
	lexa_kernel::public_using! {
		auth_service,
	}
}

mod specs
{
	lexa_kernel::public_import! {
		owasp,
	}
}

mod views
{
	lexa_kernel::public_using! {
		login_view,
		signup_view,
	}
}
