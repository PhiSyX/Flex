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

pub(crate) mod dto
{
	lexa_kernel::public_using! {
		user_new_action_dto,
		user_session_dto,
	}
}

pub(crate) mod entities
{
	lexa_kernel::public_using! {
		user_entity,
	}
}

pub(crate) mod repositories
{
	lexa_kernel::public_using! {
		user_repository,
	}
}

mod routes
{
	lexa_kernel::public_using! {
		api,
	}
}

pub(crate) mod sessions
{
	lexa_kernel::public_import! {
		constant,
	}
}
