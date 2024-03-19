// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
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
	/// Syntaxe de l'attribut : `<attribute-name>:if=<bool-expr>`
	pub fn handle_maybe_if_attribute(
		&self,
		tag_name: &str,
		tag_attrs: &mut Vec<TokenStream2>,
		children: &[TokenStream2],
		attr: &rstml::node::KeyedAttribute,
	) -> Result<TokenStream2>
	{
		let attr_name_s = attr.key.to_string();
		let attr_name = &attr_name_s[..attr_name_s.len() - 3];
		tag_attrs.push(tmp::create_attribute_bool(attr_name, attr.value()));
		let element = tmp::create_element(tag_name, tag_attrs, children);
		Ok(quote! { #element })
	}

	/// Syntaxe de l'attribut : `let-<attribute-name>:option=<optional-expr>`
	pub fn handle_maybe_option_attribute(
		&self,
		tag_name: &str,
		tag_attrs: &[TokenStream2],
		children: &[TokenStream2],
		attr: &rstml::node::KeyedAttribute,
	) -> Result<TokenStream2>
	{
		let attr_name_s = attr.key.to_string();
		let attr_name = &attr_name_s["let-".len()..attr_name_s.len() - ":option".len()];
		let element =
			tmp::create_element_option(tag_name, tag_attrs, children, attr_name, attr.value());
		Ok(quote! { #element })
	}

	/// Syntaxe de l'attribut : `let-<attribute-name>:result=<result-expr>`
	pub fn handle_maybe_result_attribute(
		&self,
		tag_name: &str,
		tag_attrs: &[TokenStream2],
		children: &[TokenStream2],
		attr: &rstml::node::KeyedAttribute,
	) -> Result<TokenStream2>
	{
		let attr_name_s = attr.key.to_string();
		let attr_name = &attr_name_s["let-".len()..attr_name_s.len() - ":result".len()];
		let element =
			tmp::create_element_result(tag_name, tag_attrs, children, attr_name, attr.value());
		Ok(quote! { #element })
	}
}
