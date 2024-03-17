// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use syn::__private::quote::quote;
use syn::__private::TokenStream2;
use syn::spanned::Spanned;

use crate::functions::html::{
	tmp,
	HTMLMacro,
	HTMLMacroParserError,
	HTMLMacroParserErrorKind,
	Result,
};

// -------------- //
// Implémentation //
// -------------- //

impl HTMLMacro
{
	/// Syntaxe de l'attribut : `if="bool_expr"`
	pub fn handle_if_attribute(
		&self,
		tag_name: &str,
		tag_attrs: &[TokenStream2],
		children: &[TokenStream2],
		attr: &rstml::node::KeyedAttribute,
	) -> Result<TokenStream2>
	{
		let new_element = tmp::create_element(tag_name, tag_attrs, children);

		let val = attr.value().ok_or_else(|| {
			HTMLMacroParserError {
				span: attr.span(),
				kind: HTMLMacroParserErrorKind::BooleanExprExpected,
			}
		})?;

		Ok(quote! {
			Node::create_fragment(
				if #val { vec![#new_element] } else { vec![] }
			)
		})
	}
}
