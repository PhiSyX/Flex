// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::macros::{command_response, reserved_numerics};

reserved_numerics! {
	| 353 <-> RPL_NAMREPLY {
		visibility: str,
		channel: str,
		nicks: str
	}
		=> "{visibility} {channel} :{nicks}"
}

reserved_numerics! {
	| 366 <-> RPL_ENDOFNAMES {
		channel: str
	} => "{channel} :Fin de la liste `/NAMES`"
}

command_response! {
	struct RPL_NAMREPLY<'c, Member>
	{
		code: u16,
		channel: &'c str,
		users: Vec<Member>,
	}
}

impl<'o, 'c, Member> RplNamreplyCommandResponse<'o, 'c, Member>
{
	pub fn code() -> u16
	{
		353
	}
}
