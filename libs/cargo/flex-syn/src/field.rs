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
/// champ.
#[rustfmt::skip]
pub fn find_attr(
	field: &syn::Field,
	attr_name: impl AsRef<str>,
) -> Option<&syn::Attribute>
{
	field.attrs
		.iter()
		.find(|attr| attr.path().is_ident(attr_name.as_ref()))
}

/// Vérifie que la structure est une structure de champs nommés.
pub fn is_named_fields(fields: &syn::Fields) -> bool
{
	matches!(fields, syn::Fields::Named(_))
}

/// Vérifie que la structure est une structure de champs nommés.
pub fn is_unit_fields(fields: &syn::Fields) -> bool
{
	matches!(fields, syn::Fields::Unit)
}
