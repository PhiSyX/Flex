// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::fmt;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(PartialEq, Eq, Hash)]
#[derive(serde::Deserialize, serde::Serialize)]
pub enum Method
{
	DELETE,
	GET,
	HEAD,
	OPTIONS,
	PATCH,
	POST,
	PUT,
	TRACE,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl fmt::Display for Method
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		let method = match self {
			| Self::DELETE => "DELETE",
			| Self::GET => "GET",
			| Self::HEAD => "HEAD",
			| Self::OPTIONS => "OPTIONS",
			| Self::PATCH => "PATCH",
			| Self::POST => "POST",
			| Self::PUT => "PUT",
			| Self::TRACE => "TRACE",
		};
		write!(f, "{}", method)
	}
}
