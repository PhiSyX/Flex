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

// --------- //
// Interface //
// --------- //

pub trait MetaSplittedByCommaExt
{
	/// Retourne un booléen si une propriété (path) est dans une méta-liste
	/// path.
	///
	/// -> #[attr( prop, prop2 )]
	fn has_path(&self, prop: impl AsRef<str>) -> bool;

	/// Récupère une propriété (name) d'une méta-name=value.
	///
	/// -> #[attr( name = "value", name2 = "value2" )]
	fn literal_value_nv(&self, name: impl AsRef<str>) -> Option<&syn::Lit>;

	/// Récupère une propriété (name) d'une méta-name=value.
	///
	/// -> #[attr( name = value, name2 = value2 )]
	fn value_nv(&self, name: impl AsRef<str>) -> Option<&syn::Expr>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl MetaSplittedByCommaExt for MetaSplittedByCommaToken
{
	#[inline]
	fn has_path(&self, prop: impl AsRef<str>) -> bool
	{
		self.iter().any(|meta| {
			meta.require_path_only()
				.map(|path| path.is_ident(prop.as_ref()))
				.unwrap_or_default()
		})
	}

	fn value_nv(&self, name: impl AsRef<str>) -> Option<&syn::Expr>
	{
		self.iter().find_map(|meta| {
			let nv = meta.require_name_value().ok()?;
			nv.path.is_ident(name.as_ref()).then_some(&nv.value)
		})
	}

	fn literal_value_nv(&self, name: impl AsRef<str>) -> Option<&syn::Lit>
	{
		self.iter().find_map(|meta| {
			let namevalue = meta.require_name_value().ok()?;
			if namevalue.path.is_ident(name.as_ref()) {
				if let syn::Expr::Lit(expr) = &namevalue.value {
					return Some(&expr.lit);
				}
			}
			None
		})
	}
}
