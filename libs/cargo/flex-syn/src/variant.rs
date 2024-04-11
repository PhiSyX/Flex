// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Interface //
// --------- //

pub trait VariantExt
{
	/// Récupère les features d'une variante.
	fn features(&self) -> Vec<&syn::Attribute>;

	/// Cherche l'attribut passé en argument parmi la liste des attributs d'un
	/// variant.
	fn find_attribute(
		&self,
		attr_name: impl AsRef<str>,
	) -> Option<&syn::Attribute>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl VariantExt for syn::Variant
{
	fn features(&self) -> Vec<&syn::Attribute>
	{
		self.attrs
			.iter()
			.filter(|attr| {
				let parser = |parser: &syn::parse::ParseBuffer| {
					parser.parse::<syn::MetaNameValue>()
				};
				let maybe_cfg = attr.parse_args_with(parser)
					.ok()
					.filter(|nv| !nv.path.is_ident("feature"));
				let cfg = attr.path().is_ident("cfg").then_some(maybe_cfg);
				cfg.is_some()
			})
			.collect()
	}

	fn find_attribute(
		&self,
		attr_name: impl AsRef<str>,
	) -> Option<&syn::Attribute>
	{
		self.attrs
			.iter()
			.find(|attr| attr.path().is_ident(attr_name.as_ref()))
	}
}
