// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use rstml::node;
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
	/// Attribut  `method`.
	pub fn handle_form_method_attribute(
		&self,
		element: &rstml::node::NodeElement,
		tag_name: &str,
		tag_attrs: &mut Vec<TokenStream2>,
		attr: &rstml::node::KeyedAttribute,
	) -> Result<TokenStream2>
	{
		if tag_name != "form" {
			return Err(HTMLMacroParserError {
				span: element.span(),
				kind: HTMLMacroParserErrorKind::InvalidTag {
					expected: "form",
					found: tag_name.to_owned(),
				},
			});
		}

		let raw_method = attr.value_literal_string();
		let not_get_or_post_method = raw_method.as_ref().filter(|method| {
			let method = method.to_uppercase();
			method == "DELETE" || method == "PATCH" || method == "PUT"
		});

		let children = self.parse(&element.children)?;

		if not_get_or_post_method.is_none() {
			tag_attrs.push(tmp::create_attribute("method", &raw_method));
			return Ok(tmp::create_element(tag_name, tag_attrs, &children));
		}

		tag_attrs.push(tmp::create_attribute("method", "POST"));

		let form_id = element.attributes()
			.iter()
			.find_map(|attribute| {
				let node::NodeAttribute::Attribute(node_attr) = attribute else {
					return None;
				};

				node_attr.key.to_string().eq("id")
					.then(|| node_attr.value_literal_string())
			})
			.unwrap_or_else(|| {
				let uid = uuid::Uuid::new_v4();
				format!("lx{}", uid.simple()).into()
			})
			.unwrap();

		tag_attrs.push(tmp::create_attribute("data-js-id", &form_id));

		let method = not_get_or_post_method.unwrap();
		let script_children = include_str!("../../../../js/form.js")
			.replace("{id}", &form_id)
			.replace("{method}", method);

		let fragment = tmp::create_fragment(&[
			tmp::create_element(tag_name, tag_attrs, &children),
			tmp::create_element(
				"script",
				&[tmp::create_attribute("type", "module")],
				&[quote! {
					Node::create_unsafe_html(#script_children)
				}],
			),
		]);

		Ok(fragment)
	}
}
