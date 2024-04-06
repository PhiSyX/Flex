// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::error;

use syn::__private::{Span, TokenStream};

// --------- //
// Interface //
// --------- //

pub trait Parser
{
	type Input: syn::parse::Parse;
	type Err<'err>: ParserError<'err>
	where
		Self: 'err;

	fn new(_: Self::Input) -> Self;

	fn analyze(&self) -> Result<TokenStream, Self::Err<'_>>;
}

pub trait ParserError<'err>: error::Error
{
	fn compile_error(self) -> TokenStream;

	fn span(self) -> Span;
}

// -------- //
// Fonction //
// -------- //

pub fn parse<'t, P>(input: TokenStream) -> TokenStream
where
	P: 't,
	P: Parser,
{
	let input = syn::parse_macro_input!(input as P::Input);
	let parser = P::new(input);
	let output = parser.analyze();
	match output {
		| Ok(token_stream) => token_stream,
		| Err(err) => err.compile_error(),
	}
}
