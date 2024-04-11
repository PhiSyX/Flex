// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use syn::Token;

use crate::meta::MetaSplittedByCommaToken;

// --------- //
// Interface //
// --------- //

pub trait AttributeExt
{
	/// Retourne une liste de méta à partir d'un attribut.
	fn metalist(&self) -> Option<MetaSplittedByCommaToken>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl AttributeExt for syn::Attribute
{
	fn metalist(&self) -> Option<MetaSplittedByCommaToken>
	{
		let parser = |buf: &syn::parse::ParseBuffer| {
			buf.parse_terminated(|a| a.parse::<syn::Meta>(), Token![,])
		};
		self.meta.require_list().ok()?.parse_args_with(parser).ok()
	}
}
