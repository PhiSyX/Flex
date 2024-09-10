// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::{error, fmt};

use flex_syn::attribute::AttributeExt;
use flex_syn::field::{FieldExt, FieldsExt};
use flex_syn::meta::MetaSplittedByCommaExt;
use flex_syn::structure::ItemStructExt;
use flex_syn::{Parser, ParserError};
use syn::__private::quote::{quote, quote_spanned};
use syn::__private::{Span, TokenStream, TokenStream2};
use syn::spanned::Spanned;

// ---- //
// Type //
// ---- //

type PromptDeriveParserInput = syn::ItemStruct;

type Result<'err, T> = std::result::Result<T, PromptDeriveParserError>;

// --------- //
// Structure //
// --------- //

pub struct PromptDerive
{
	item_struct: PromptDeriveParserInput,
}

#[derive(Debug)]
pub struct PromptDeriveParserError
{
	span: syn::__private::Span,
	kind: ErrorDeriveParserErrorKind,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum ErrorDeriveParserErrorKind
{
	IsNotNamedStruct,
	OneOfPropertiesIsRequired,
	PromptAttributeFormatIsInvalid
	{
		field: String,
	},
}

// -------------- //
// Implémentation //
// -------------- //

impl PromptDerive
{
	pub const ATTRIBUTE_NAME: &'static str = "prompt";

	#[rustfmt::skip]
	fn parse_field<'a>(&'a self, field: &'a syn::Field) -> Result<'a, TokenStream2>
	{
		let Some(attribute) = field.find_attribute(Self::ATTRIBUTE_NAME) else {
			let field_name = &field.ident;
			let field_type = &field.ty;

			return Ok(quote! {
				#field_name : #field_type :: prompt()?,
			});
		};

		let has_meta = matches!(attribute.meta, syn::Meta::Path(_) | syn::Meta::List(_));
		if !has_meta {
			return Err(PromptDeriveParserError {
				span: attribute.span(),
				kind:
					ErrorDeriveParserErrorKind::PromptAttributeFormatIsInvalid {
						field: field
							.ident
							.as_ref()
							.expect("identifiant du champ")
							.to_string(),
					},
			});
		}

		let meta_list = attribute.metalist().ok_or_else(|| {
			PromptDeriveParserError {
				span: attribute.span(),
				kind: ErrorDeriveParserErrorKind::OneOfPropertiesIsRequired,
			}
		})?;

		let confirm_value = meta_list.literal_value_nv("confirm");

		if let Some(confirm_value) = confirm_value {
			let field_name = &field.ident;
			let field_type = if let syn::Type::Path(ty_path) = &field.ty {
				let seg = &ty_path.path.segments[0];
				if seg.ident == "Option" {
					match &seg.arguments {
						| syn::PathArguments::AngleBracketed(ty_path) => {
							let x = &ty_path.args[0];
							Some(x)
						}
						| _ => None,
					}
				} else {
					None
				}
			} else {
				None
			};

			return Ok(quote! {
				#field_name : if flex_prompt::confirm(#confirm_value) {
					#field_type :: prompt().ok()
				} else {
					None
				},
			});
		}

		let ask_value = meta_list.literal_value_nv("ask");
		let default_value = meta_list.value_nv("default");
		let list_value = meta_list.value_nv("list");

		let field_name = &field.ident;

		if let Some(ty) = list_value {
			Ok(quote! {
				#field_name : flex_prompt::for_loop2::<#ty>(#ask_value, |_| {
					Ok(flex_prompt::Validation::Valid)
				}),
			})
		} else if default_value.is_some() {
			Ok(quote! {
				#field_name : flex_prompt::default(#ask_value, #default_value)?,
			})
		} else {
			Ok(quote! {
				#field_name : flex_prompt::required(#ask_value)?,
			})
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Parser for PromptDerive
{
	type Err<'err> = PromptDeriveParserError;
	type Input = PromptDeriveParserInput;

	fn new(input: Self::Input) -> Self
	{
		Self { item_struct: input }
	}

	fn analyze(&self) -> Result<'_, TokenStream>
	{
		if !self.item_struct.fields.is_named_fields() {
			return Err(PromptDeriveParserError {
				span: self.item_struct.span(),
				kind: ErrorDeriveParserErrorKind::IsNotNamedStruct,
			});
		}

		let fields: Vec<_> = self
			.item_struct
			.fields
			.iter()
			.map(|f| self.parse_field(f))
			.collect::<Result<_>>()?;

		let title = self
			.item_struct
			.find_attribute(Self::ATTRIBUTE_NAME)
			.and_then(|attribute| {
				if let Some(list) = attribute.metalist() {
					let title_value = list.literal_value_nv("title");
					Some(quote! {
						println!(#title_value);
					})
				} else {
					None
				}
			});

		let item_struct_name = &self.item_struct.ident;
		let output = quote! {
			impl flex_prompt::Prompt for #item_struct_name {
				fn prompt() -> flex_prompt::Result<Self> {
					#title
					Ok(Self {
						#(#fields)*
					})
				}
			}
		};

		let output = <TokenStream2 as Into<TokenStream>>::into(output);
		Ok(output)
	}
}

impl<'err> ParserError<'err> for PromptDeriveParserError
{
	fn compile_error(self) -> TokenStream
	{
		let err_s = self.to_string();
		let tokens = quote_spanned! {
			self.span() => compile_error!(#err_s);
		};
		TokenStream::from(tokens)
	}

	fn span(self) -> Span
	{
		self.span
	}
}

impl error::Error for PromptDeriveParserError {}

impl fmt::Display for PromptDeriveParserError
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		let attr_s = format!("#[{}]", PromptDerive::ATTRIBUTE_NAME);

		let err_s = match self.kind {
			| ErrorDeriveParserErrorKind::IsNotNamedStruct => {
				String::from("ne supporte que les structures de champs nommés.")
			}

			| ErrorDeriveParserErrorKind::OneOfPropertiesIsRequired => {
				format!(
					"l'attribut {attr_s} a besoin d'une dès clés suivantes: \
					 `ask`, `confirm`, `default`, `title`.",
				)
			}
			| ErrorDeriveParserErrorKind::PromptAttributeFormatIsInvalid {
				ref field,
			} => {
				format!(
					"le format de l'attribut {attr_s} pour le champ « {} » \
					 est invalide.",
					field,
				)
			}
		};

		write!(f, "#[derive(Prompt)]: {}", err_s)
	}
}
