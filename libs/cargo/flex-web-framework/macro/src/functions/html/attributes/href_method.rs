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
	HTMLCustomAttribute,
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
	/// Attribut  `href:delete`, `href:patch`, `href:post`, `href:put`.
	pub fn handle_href_method_attribute(
		&self,
		element: &rstml::node::NodeElement,
		tag_name: &str,
		_: &mut Vec<TokenStream2>,
		attr: &rstml::node::KeyedAttribute,
		custom_attr: HTMLCustomAttribute,
	) -> Result<TokenStream2>
	{
		assert!(matches!(
			custom_attr,
			HTMLCustomAttribute::HrefDelete
				| HTMLCustomAttribute::HrefPost
				| HTMLCustomAttribute::HrefPut
		));
		if tag_name != "a" {
			return Err(HTMLMacroParserError {
				span: element.span(),
				kind: HTMLMacroParserErrorKind::InvalidTag {
					expected: "a",
					found: tag_name.to_owned(),
				},
			});
		}

		let link_id = element.attributes()
			.iter()
			.find_map(|attribute| {
				if let node::NodeAttribute::Attribute(node_attr) = attribute {
					return node_attr.key.to_string().eq("id")
						.then(|| node_attr.value_literal_string());
				}

				None
			})
			.unwrap_or_else(|| {
				let uid = uuid::Uuid::new_v4();
				format!("lx{}", uid.simple()).into()
			})
			.unwrap();
		let href_value = attr.value();

		let mut tag_attrs: Vec<_> = element.attributes()
			.iter()
			.filter_map(|attr| {
				let node::NodeAttribute::Attribute(attr) = attr else {
					return None;
				};

				let attr_key = attr.key.to_string();
				if attr_key.contains("data-") || attr_key.contains(':') {
					return None;
				}

				Some(tmp::create_attribute(attr_key, attr.value()))
			})
			.collect();

		tag_attrs.extend([
			tmp::create_attribute("href", href_value),
			tmp::create_attribute("form", &link_id),
		]);

		let method = match custom_attr {
			| HTMLCustomAttribute::HrefPatch => "PATCH",
			| HTMLCustomAttribute::HrefPost => "POST",
			| HTMLCustomAttribute::HrefPut => "PUT",
			| HTMLCustomAttribute::HrefDelete => "DELETE",
			| _ => "",
		};
		let script_attrs = [tmp::create_attribute("type", "module")];
		let script_children = include_str!("../../../../js/form_link.js")
			.replace("{id}", &link_id)
			.replace("{method}", method);

		let link_children = self.parse(&element.children)?;
		let mut form_children = element.attributes()
			.iter()
			.filter_map(|attr| {
				let node::NodeAttribute::Attribute(attr) = attr else {
					return None;
				};

				let key_without_data_keyword = &attr.key.to_string()[5..];
				let data_key_value = attr.value();

				attr.key.to_string().contains("data-").then_some({
					tmp::create_void_element(
						"input",
						&[
							tmp::create_attribute("type", "hidden"),
							tmp::create_attribute(
								"name",
								key_without_data_keyword,
							),
							tmp::create_attribute("value", data_key_value),
						],
					)
				})
			})
			.collect::<Vec<_>>();

		form_children.push(tmp::create_void_element(
			"input",
			&[
				tmp::create_attribute("type", "hidden"),
				tmp::create_attribute("name", "_method"),
				tmp::create_attribute("value", method),
			],
		));

		let fragment = tmp::create_fragment(&[
			tmp::create_element(
				"form",
				&[
					tmp::create_attribute("id", &link_id),
					tmp::create_attribute("action", href_value),
					tmp::create_attribute("method", "POST"),
				],
				&form_children,
			),
			tmp::create_element("a", &tag_attrs, &link_children),
			tmp::create_element(
				"script",
				&script_attrs,
				&[quote! {
					Node::create_unsafe_html(#script_children)
				}],
			),
		]);

		Ok(fragment)
	}
}
