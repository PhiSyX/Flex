// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_syn::{Parser, ParserError};
use proc_macro::TokenStream;
use syn::__private::quote::quote;
use syn::__private::{Span, TokenStream2};

// --------- //
// Structure //
// --------- //

pub struct ImportMacro
{
	input: ImportMacroInput,
}

pub struct ImportMacroInput
{
	imports: syn::punctuated::Punctuated<ImportMacroInputItem, syn::Token![;]>,
}

pub enum ImportMacroInputItem
{
	Item(syn::Ident),
	Import(Import),
	ImportAll(ImportAll),
	ImportItems(ImportItems),
}

pub struct Import
{
	vis: syn::Visibility,
	ident: syn::Ident,
}

pub struct ImportAll
{
	vis: syn::Visibility,
	ident: syn::Ident,
	export_all: bool,
}

pub struct ImportItems
{
	vis: syn::Visibility,
	ident: syn::Ident,
	tree: syn::punctuated::Punctuated<ImportMacroInputItem, syn::Token![;]>,
	export_all: bool,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum ImportMacroError {}

// -------------- //
// Implémentation //
// -------------- //

impl ImportMacro
{
	fn generate(
		imports: &syn::punctuated::Punctuated<
			ImportMacroInputItem,
			syn::Token![;],
		>,
	) -> impl Iterator<Item = TokenStream2> + '_
	{
		let cb_item = |ident: &syn::Ident| {
			quote! {
				#ident,
			}
		};
		let cb_import = |import: &Import| {
			let vis = &import.vis;
			let name = &import.ident;
			quote! {
				#vis mod #name;
			}
		};

		let cb_import_all = |import: &ImportAll| {
			let vis = &import.vis;
			let name = &import.ident;
			if import.export_all {
				quote! {
					mod #name;
					#vis use self:: #name::*;
				}
			} else {
				quote! {
					#vis mod #name;
				}
			}
		};

		let cb_import_items = |import: &ImportItems| {
			let vis = &import.vis;
			let name = &import.ident;
			let tree = Self::generate(&import.tree);
			if import.export_all {
				quote! {
					#vis mod #name { #(#tree)* }
					#vis use self::#name::*;
				}
			}
			/* TODO:
			else if xxx {
				quote! {
					mod #name;
					#vis use self::#name::{
						#(#tree)*
					};
				}
			}
			*/
			else {
				quote! {
					#vis mod #name {
						#(#tree)*
					}
				}
			}
		};

		let cb = move |import_input_item: &ImportMacroInputItem| {
			match import_input_item {
				| ImportMacroInputItem::Item(ident) => cb_item(ident),
				| ImportMacroInputItem::Import(import) => cb_import(import),
				| ImportMacroInputItem::ImportAll(import) => {
					cb_import_all(import)
				}
				| ImportMacroInputItem::ImportItems(import) => {
					cb_import_items(import)
				}
			}
		};

		imports.iter().map(cb)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Parser for ImportMacro
{
	type Err<'err> = ImportMacroError where Self: 'err;
	type Input = ImportMacroInput;

	fn new(input: Self::Input) -> Self
	{
		Self { input }
	}

	fn analyze(&self) -> Result<TokenStream, Self::Err<'_>>
	{
		let imports = Self::generate(&self.input.imports);
		Ok(quote! { #(#imports)* }.into())
	}
}

impl<'err> ParserError<'err> for ImportMacroError
{
	fn compile_error(self) -> TokenStream
	{
		todo!()
	}

	fn span(self) -> Span
	{
		todo!()
	}
}

impl std::error::Error for ImportMacroError {}

impl std::fmt::Display for ImportMacroError
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "import! error")
	}
}

impl syn::parse::Parse for ImportMacroInput
{
	fn parse(input: syn::parse::ParseStream) -> syn::Result<Self>
	{
		Ok(Self {
			imports: input.parse_terminated(
				ImportMacroInputItem::parse,
				syn::Token![;],
			)?,
		})
	}
}

impl syn::parse::Parse for ImportMacroInputItem
{
	fn parse(input: syn::parse::ParseStream) -> syn::Result<Self>
	{
		let visibility = input.parse()?;

		if input.peek(syn::Ident) {
			return Ok(Self::Item(input.parse()?));
		}

		if input.peek(syn::Token![mod]) {
			input.parse::<syn::Token![mod]>()?;
		}

		let name = input.parse()?;

		if input.peek(syn::Token![use]) {
			// NOTE: use ...
			input.parse::<syn::Token![use]>()?;

			// NOTE: use *;
			if input.peek(syn::Token![*]) {
				input.parse::<syn::Token![*]>()?;

				return Ok(Self::ImportAll(ImportAll {
					vis: visibility,
					ident: name,
					export_all: true,
				}));
			}

			// NOTE: use { ... };
			if input.peek(syn::token::Brace) {
				let tree;
				syn::braced!(tree in input);
				return Ok(Self::ImportItems(ImportItems {
					vis: visibility,
					ident: name,
					tree: tree.parse_terminated(
						ImportMacroInputItem::parse,
						syn::Token![;],
					)?,
					export_all: true,
				}));
			}
		} else if input.peek(syn::token::Brace) {
			// NOTE: use { ... };
			let tree;
			syn::braced!(tree in input);
			return Ok(Self::ImportItems(ImportItems {
				vis: visibility,
				ident: name,
				tree: tree.parse_terminated(
					ImportMacroInputItem::parse,
					syn::Token![;],
				)?,
				export_all: false,
			}));
		}

		Ok(Self::Import(Import {
			vis: visibility,
			ident: name,
		}))
	}
}
