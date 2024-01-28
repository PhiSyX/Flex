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
		mod access_level
		{
			lexa_kernel::public_using! {
				formdata,
				handler,
			}
		}

		mod apply;
		mod response;

		pub use self::access_level::*;
		pub use self::apply::*;
		pub use self::response::*;
	}

	pub use self::mode::*;

	lexa_kernel::public_using! {
		connect / {
			formdata,
			handler,
		};

		ignore / {
			formdata,
			handler,
			response,
		};

		join / {
			error,
			formdata,
			handler,
			response,
		};

		list / {
			formdata,
			handler,
			response,
		};

		kick / {
			formdata,
			handler,
			response,
		};

		nick / {
			formdata,
			handler,
			response,
		};

		part / {
			formdata,
			handler,
			response,
		};

		oper / {
			formdata,
			handler,
			response,
		};

		pass / {
			formdata,
			handler,
		};

		privmsg / {
			formdata,
			handler,
			response,
		};

		quit / {
			formdata,
			handler,
			response,
		};

		topic / {
			error,
			formdata,
			handler,
			response,
		};

		user / {
			formdata,
			handler,
		};
	}

	mod user_status
	{
		lexa_kernel::public_using! {
			away / {
				formdata,
				handler,
				response,
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
			err_badchannelkey,
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

	pub use super::features::{
		ErrNooperhostError,
		ErrOperonlyError,
		ErrPasswdmismatchError,
		RplYoureoperReply,
	};
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
