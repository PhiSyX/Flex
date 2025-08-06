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

pub trait FieldExt
{
	/// Cherche l'attribut passé en argument parmi la liste des attributs d'un
	/// champ.
	fn find_attribute(
		&self,
		attr_name: impl AsRef<str>,
	) -> Option<&syn::Attribute>;
}

pub trait FieldsExt
{
	/// Vérifie que la structure est une structure de champs nommés.
	fn is_named_fields(&self) -> bool;

	/// Vérifie que la structure est une structure unitaire.
	fn is_unit_fields(&self) -> bool;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl FieldExt for syn::Field
{
	fn find_attribute(
		&self,
		attr_name: impl AsRef<str>,
	) -> Option<&syn::Attribute>
	{
		self.attrs.iter().find(|attr| attr.path().is_ident(attr_name.as_ref()))
	}
}

impl FieldsExt for syn::Fields
{
	fn is_named_fields(&self) -> bool
	{
		matches!(self, syn::Fields::Named(_))
	}

	fn is_unit_fields(&self) -> bool
	{
		matches!(self, syn::Fields::Unit)
	}
}
