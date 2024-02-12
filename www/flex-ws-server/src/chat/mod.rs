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
	pub(crate) mod channel;
	pub(crate) mod client;
	pub(crate) mod user;

	pub(crate) use self::channel::*;
	pub(crate) use self::client::*;
	pub(crate) use self::user::*;
}

mod feature;

mod features
{
	mod mode
	{
		mod channel_access_level
		{
			lexa_kernel::public_using! {
				application,
				client,
				formdata,
				handler,
				session,
			}
		}

		mod channel_settings
		{
			lexa_kernel::public_using! {
				application,
				client,
				formdata,
				handler,
			}
		}

		mod apply;
		mod response;

		pub use self::apply::*;
		pub use self::channel_access_level::*;
		pub use self::channel_settings::*;
		pub use self::response::*;
	}

	pub use self::mode::*;

	lexa_kernel::public_using! {
		connect / {
			application,
			formdata,
			handler,
			session,
		};

		join / {
			application,
			client,
			error,
			formdata,
			handler,
			response,
			session,
		};

		kick / {
			application,
			client,
			formdata,
			handler,
			response,
		};

		kill / {
			application,
			client,
			formdata,
			handler,
			response,
		};

		list / {
			client,
			formdata,
			handler,
			response,
		};

		nick / {
			application,
			client,
			formdata,
			handler,
			response,
			session,
		};

		notice / {
			application,
			client,
			formdata,
			handler,
			response,
		};

		oper / {
			application,
			client,
			formdata,
			handler,
			response,
			session,
		};

		part / {
			application,
			client,
			formdata,
			handler,
			response,
			session,
		};

		pass / {
			formdata,
			handler,
		};

		privmsg / {
			client,
			formdata,
			handler,
			response,
		};

		pubmsg / {
			application,
			client,
			formdata,
			handler,
			response,
		};

		quit / {
			application,
			client,
			formdata,
			handler,
			response,
		};

		silence / {
			application,
			client,
			formdata,
			handler,
			response,
			session,
		};

		topic / {
			application,
			client,
			error,
			formdata,
			handler,
			response,
			session,
		};

		user / {
			client,
			formdata,
			handler,
		};
	}

	mod user_status
	{
		lexa_kernel::public_using! {
			away / {
				application,
				client,
				formdata,
				handler,
				response,
				session,
			};
		}
	}

	pub use self::user_status::*;
}

mod replies
{
	lexa_kernel::public_using! {
		errors / {
			err_alreadyregistered,
			err_cannotsendtochan,
			err_chanoprivsneeded,
			err_erroneusnickname,
			err_nicknameinuse,
			err_noprivileges,
			err_nosuchchannel,
			err_nosuchnick,
			err_notonchannel,
			err_usernotinchannel,
		};

		reserved_numerics / {
			rpl_created,
			rpl_namreply,
			rpl_yourhost,
			rpl_welcome,
		};
	}
}

mod routes;

mod sessions
{
	mod channel;
	mod client;

	pub(crate) use self::channel::*;
	pub(crate) use self::client::*;
}

pub use self::feature::*;

lexa_kernel::using! {
	controllers / {
		pub home,
	};
}
