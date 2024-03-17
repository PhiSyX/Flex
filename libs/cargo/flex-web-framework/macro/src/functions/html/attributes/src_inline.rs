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
	pub fn handle_src_inline_attribute(
		&self,
		element: &rstml::node::NodeElement,
		tag_name: &str,
		tag_attrs: &[TokenStream2],
		attr: &rstml::node::KeyedAttribute,
	) -> Result<TokenStream2>
	{
		if tag_name != "script" {
			return Err(HTMLMacroParserError {
				span: element.span(),
				kind: HTMLMacroParserErrorKind::InvalidTag {
					expected: "script",
					found: tag_name.to_owned(),
				},
			});
		}

		let src_value = attr.value().ok_or_else(|| {
			HTMLMacroParserError {
				span: attr.span(),
				kind: HTMLMacroParserErrorKind::AttributeValueIsRequired,
			}
		})?;

		Ok(tmp::create_element(
			"script",
			tag_attrs,
			&[quote! {
				Node::create_unsafe_html_from_file(
					std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
						.join(#src_value)
				)
			}],
		))
	}
}
