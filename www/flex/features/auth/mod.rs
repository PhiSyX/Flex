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

	pub mod api
	{
		pub mod v1
		{
			lexa_kernel::public_using! {
				users_controller,
			}
		}
	}
}

mod dto
{
	lexa_kernel::public_using! {
		user_cookie_dto,
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

mod entities
{
	lexa_kernel::public_using! {
		user_entity,
	}
}

mod middleware
{
	lexa_kernel::public_using! {
		auth_middleware,
		guest_middleware,
	}
}

mod repositories
{
	lexa_kernel::public_using! {
		user_repository,
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
		api,
		web,
	}
}

mod services
{
	lexa_kernel::public_using! {
		auth_service,
	}
}

mod sessions
{
	lexa_kernel::public_import! {
		constants,
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
