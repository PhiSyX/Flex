// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::{error, fmt};

use lexa_syn::field;
use syn::__private::quote::{quote, quote_spanned};
use syn::__private::{Span, TokenStream, TokenStream2};
use syn::spanned::Spanned;

// ---- //
// Type //
// ---- //

pub type ViewDeriveParserInput = syn::ItemStruct;
type Result<'err, T> = std::result::Result<T, ViewDeriveParserError>;

// --------- //
// Structure //
// --------- //

pub struct ViewDerive
{
	item_struct: ViewDeriveParserInput,
}

#[derive(Debug)]
pub struct ViewDeriveParserError
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
	IsNotNamedOrUnitStruct,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl lexa_syn::Parser for ViewDerive
{
	type Err<'err> = ViewDeriveParserError;
	type Input = ViewDeriveParserInput;

	fn new(input: Self::Input) -> Self
	{
		Self { item_struct: input }
	}

	fn analyze(&self) -> Result<'_, TokenStream>
	{
		if !field::is_named_fields(&self.item_struct.fields)
			&& !field::is_unit_fields(&self.item_struct.fields)
		{
			return Err(ViewDeriveParserError {
				span: self.item_struct.span(),
				kind: ErrorDeriveParserErrorKind::IsNotNamedOrUnitStruct,
			});
		}

		let item_struct_name = &self.item_struct.ident;
		let output = quote! {
			impl flex_web_framework::http::IntoResponse for #item_struct_name
			{
				fn into_response(self) -> flex_web_framework::http::Response
				{
					use flex_web_framework::ViewInterface;
					flex_web_framework::http::response::Html(self.render().to_string())
						.into_response()
				}
			}

			impl From<#item_struct_name> for flex_web_framework::http::Body
			{
				fn from(v: #item_struct_name) -> Self
				{
					use flex_web_framework::ViewInterface;
					Self::new(v.render().to_string())
				}
			}
		};

		let output = <TokenStream2 as Into<TokenStream>>::into(output);
		Ok(output)
	}
}

impl<'err> lexa_syn::ParserError<'err> for ViewDeriveParserError
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

impl error::Error for ViewDeriveParserError {}

impl fmt::Display for ViewDeriveParserError
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		let err_s = match self.kind {
			| ErrorDeriveParserErrorKind::IsNotNamedOrUnitStruct => {
				String::from(
					"ne supporte que les structures de champs nommés ou les \
					 structures unitaires.",
				)
			}
		};

		write!(f, "#[derive(View)]: {}", err_s)
	}
}
