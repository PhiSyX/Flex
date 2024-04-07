// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use syn::Token;

// ---- //
// Type //
// ---- //

#[rustfmt::skip]
pub type MetaSplittedByCommaToken = syn::punctuated::Punctuated<syn::Meta, Token![,]>;

// -------- //
// Fonction //
// -------- //

/// Retourne une liste de méta à partir d'un attribut.
#[rustfmt::skip]
pub fn get_metalist_from_attr(
	attr: &syn::Attribute,
) -> Option<MetaSplittedByCommaToken>
{
	let metalist = attr.meta.require_list().ok()?;
	metalist.parse_args_with(|buf: &syn::parse::ParseBuffer| {
		buf.parse_terminated(|a| a.parse::<syn::Meta>(), Token![,])
	})
	.ok()
}

/// Récupère une propriété (name) d'une méta-name=value.
///
/// -> #[attr( name = value, name2 = value2 )]
#[rustfmt::skip]
pub fn get_value_in_meta_namevalue(
	metalist: &MetaSplittedByCommaToken,
	name: impl AsRef<str>,
) -> Option<&syn::Expr>
{
	metalist.iter().find_map(|meta| {
		let namevalue = meta.require_name_value().ok()?;
		namevalue.path.is_ident(name.as_ref())
			.then_some(&namevalue.value)
	})
}

/// Récupère une propriété (name) d'une méta-name=value.
///
/// -> #[attr( name = "value", name2 = "value2" )]
pub fn get_value_lit_in_meta_namevalue(
	metalist: &MetaSplittedByCommaToken,
	name: impl AsRef<str>,
) -> Option<&syn::Lit>
{
	metalist.iter().find_map(|meta| {
		let namevalue = meta.require_name_value().ok()?;
		if namevalue.path.is_ident(name.as_ref()) {
			if let syn::Expr::Lit(expr) = &namevalue.value {
				return Some(&expr.lit);
			}
		}
		None
	})
}

/// Retourne un booléen si une propriété (path) est dans une méta-liste path.
///
/// -> #[attr( prop, prop2 )]
#[inline]
pub fn has_path_in_meta_path(
	metalist: &MetaSplittedByCommaToken,
	prop: impl AsRef<str>,
) -> bool
{
	metalist.iter().any(|meta| {
		meta.require_path_only()
			.map(|path| path.is_ident(prop.as_ref()))
			.unwrap_or_default()
	})
}
