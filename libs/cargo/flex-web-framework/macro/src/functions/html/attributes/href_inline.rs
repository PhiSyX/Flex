// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use syn::__private::TokenStream2;
use syn::__private::quote::quote;
use syn::spanned::Spanned;

use crate::functions::html::{
	HTMLMacro,
	HTMLMacroParserError,
	HTMLMacroParserErrorKind,
	Result,
	tmp,
};

// -------------- //
// Implémentation //
// -------------- //

impl HTMLMacro
{
	/// Attribut `href:inline`.
	pub fn handle_href_inline_attribute(
		&self,
		element: &rstml::node::NodeElement,
		tag_name: &str,
		tag_attrs: &[TokenStream2],
		attr: &rstml::node::KeyedAttribute,
	) -> Result<TokenStream2>
	{
		if tag_name != "link" {
			return Err(HTMLMacroParserError {
				span: element.span(),
				kind: HTMLMacroParserErrorKind::InvalidTag {
					expected: "link",
					found: tag_name.to_owned(),
				},
			});
		}

		if !element.attributes().iter().any(|attr| {
			match attr {
				| rstml::node::NodeAttribute::Block(_) => false,
				| rstml::node::NodeAttribute::Attribute(attr) => {
					attr.key.to_string() == "rel"
						&& attr.value_literal_string().unwrap_or_default()
							== "stylesheet"
				}
			}
		}) {
			return Err(HTMLMacroParserError {
				span: element.span(),
				kind: HTMLMacroParserErrorKind::AttributesRequired {
					attributes: &[("rel", Some("stylesheet"))],
				},
			});
		}

		let href_value = attr.value();

		let element = tmp::create_element(
			"style",
			tag_attrs,
			&[quote! {
				Node::create_unsafe_html_from_file(
					std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
						.join(#href_value)
				),
			}],
		);

		Ok(element)
	}
}
