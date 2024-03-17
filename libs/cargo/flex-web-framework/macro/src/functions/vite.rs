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

use syn::__private::quote::{quote, quote_spanned};
use syn::__private::{Span, TokenStream, TokenStream2};

// ---- //
// Type //
// ---- //

pub type ViteMacroParserInput = syn::LitStr;
pub(super) type Result<'err, T> = std::result::Result<T, ViteMacroParserError>;

// --------- //
// Structure //
// --------- //

pub struct ViteMacro
{
	tokens: ViteMacroParserInput,
}

#[derive(Debug)]
#[derive(Clone)]
pub struct ViteMacroParserError
{
	span: syn::__private::Span,
	_kind: ViteMacroParserErrorKind,
}

#[derive(Debug)]
#[derive(Clone)]
pub enum ViteMacroParserErrorKind {}

// -------------- //
// Implémentation //
// -------------- //

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl lexa_syn::Parser for ViteMacro
{
	type Err<'err> = ViteMacroParserError;
	type Input = ViteMacroParserInput;

	fn new(input: Self::Input) -> Self
	{
		Self { tokens: input }
	}

	fn analyze(&self) -> Result<'_, TokenStream>
	{
		let vite_path = self.tokens.value();
		let output = if vite_path.starts_with("http://") || vite_path.starts_with("https://") {
			let (vite_url, vite_root) = vite_path
				.split_once('#')
				.unwrap_or_else(|| (&vite_path, "root"));
			quote! {
				{
					self.with_env("VITE_URL", #vite_url);
					self.with_env("VITE_ROOT", #vite_root);
					Node::create_text("")
				}
			}
		} else {
			let dist_vite = format!("{vite_path}/dist/index.html");
			quote! { Node::create_unsafe_html_from_file(#dist_vite) }
		};
		let output = <TokenStream2 as Into<TokenStream>>::into(output);
		Ok(output)
	}
}

// -------------- //
// Implémentation // -> Error
// -------------- //

impl<'err> lexa_syn::ParserError<'err> for ViteMacroParserError
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

// -------------- //
// Implémentation // -> Error
// -------------- //

impl error::Error for ViteMacroParserError {}

impl fmt::Display for ViteMacroParserError
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		// TODO
		let err_s = "";
		write!(f, "`vite!` macro: {}", err_s)
	}
}
