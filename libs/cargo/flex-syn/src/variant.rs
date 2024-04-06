// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// -------- //
// Fonction //
// -------- //

/// Cherche l'attribut passé en argument parmi la liste des attributs d'un
/// variant.
pub fn find_attr(
	variant: &syn::Variant,
	attr_name: impl AsRef<str>,
) -> Option<&syn::Attribute>
{
	variant.attrs
		.iter()
		.find(|attr| attr.path().is_ident(attr_name.as_ref()))
}

/// Récupère les features d'une variante.
pub fn get_features(variant: &syn::Variant) -> Vec<&syn::Attribute>
{
	variant.attrs
		.iter()
		.filter(|attr| {
			let cfg = attr.path().is_ident("cfg").then_some(
				attr.parse_args_with(|parser: &syn::parse::ParseBuffer| {
					parser.parse::<syn::MetaNameValue>()
				})
				.ok()
				.filter(|nv| !nv.path.is_ident("feature")),
			);
			cfg.is_some()
		})
		.collect()
}
