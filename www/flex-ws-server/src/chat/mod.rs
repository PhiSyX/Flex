// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

pub mod components
{
	pub(crate) mod client;
	pub(crate) mod user;

	pub(crate) use self::client::*;
	pub(crate) use self::user::*;
}

mod feature;

mod features
{
	lexa_kernel::public_using! {
		connect / {
			formdata,
			handler,
		};

		nick / {
			formdata,
			handler,
			response,
		};

		pass / {
			formdata,
			handler,
		};

		quit / {
			formdata,
			handler,
			response,
		};

		user / {
			formdata,
			handler,
		};
	}
}

mod replies
{
	lexa_kernel::public_using! {
		errors / {
			err_alreadyregistered,
			err_erroneusnickname,
			err_nicknameinuse,
		};

		reserved_numerics / {
			rpl_created,
			rpl_yourhost,
			rpl_welcome,
		};
	}
}

mod routes;

mod sessions
{
	mod client;

	pub(crate) use self::client::*;
}

pub use self::feature::*;

lexa_kernel::using! {
	controllers / {
		pub home,
	};
}
