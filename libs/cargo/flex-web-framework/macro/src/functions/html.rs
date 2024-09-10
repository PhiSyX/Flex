// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod attributes
{
	mod for_let;
	mod form_method;
	mod href_inline;
	mod href_method;
	mod if_stmt;
	mod maybe;
	mod src_inline;
}

use std::{error, fmt};

use diagnostics::SpanDiagnosticExt;
use syn::__private::quote::{quote, quote_spanned};
use syn::__private::{Span, TokenStream, TokenStream2};
use syn::parse::Parse;
use syn::Token;

// -------- //
// Constant //
// -------- //

#[rustfmt::skip]
const VOID_ELEMENTS: [&str; 13] = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"source",
	"track",
	"wbr",
];

// ---- //
// Type //
// ---- //

pub type HTMLMacroParserInput = TokenStream2;
pub(super) type Result<'err, T> = std::result::Result<T, HTMLMacroParserError>;

// --------- //
// Structure //
// --------- //

pub struct HTMLMacro
{
	tokens: HTMLMacroParserInput,
	parser: rstml::Parser,
}

#[derive(Debug)]
#[derive(Clone)]
pub struct HTMLMacroParserError
{
	span: syn::__private::Span,
	kind: HTMLMacroParserErrorKind,
}

// ----------- //
// Énumération //
// ----------- //

enum HTMLBlock
{
	/// `unsafe for iter()` -> Iterator<Item = DangerousTextNode>
	UnsafeFor(syn::Expr),
	/// `for iter()`
	For(syn::Expr),

	/// `echo expr` -> TextNode
	Echo(syn::Expr),
	/// `json | expr`
	Json(syn::Expr),
	/// `json_pretty | expr`
	JsonPretty(syn::Expr),

	/// `unsafe expr` -> DangerousTextNode
	UnsafeExpr(syn::Expr),
	/// `expr`
	Expr(syn::Expr),
}

pub enum HTMLCustomAttribute
{
	/// Syntaxe de l'attribute : `<attr>:if=<optional-expr>`
	///
	/// Permet de ne pas crée **l'attribut** de l'élément si le booléen est
	/// faux.
	MaybeIf,
	/// Syntaxe de l'attribute : `let-<attr>:option=<optional-expr>`
	MaybeOption,
	/// Syntaxe de l'attribute : `let-<attr>:result=<result-expr>`
	MaybeResult,

	/// Syntaxe de l'attribut : `for-let:<identifier>="<iterable>"`
	ForLet,

	/// Syntaxe de l'attribut : `if="bool-expr"`
	///
	/// Permet de ne pas créer **l'élément complet** si le booléen est faux.
	If,

	/// Attribut `href:inline`.
	///
	/// Utilisé pour les éléments `LINK`.
	HrefInline,

	/// Attribut  `href:delete`, `href:patch`, `href:post`, `href:put`.
	///
	/// Utilisé pour les éléments `A`.
	HrefDelete,
	HrefPatch,
	HrefPost,
	HrefPut,

	/// Attribut  `method`.
	///
	/// Utilisé pour les éléments `FORM`.
	FormMethod,

	/// Attribut `src:inline`.
	///
	/// Utilisé pour les éléments `SCRIPT`.
	SrcInline,
}

#[derive(Debug)]
#[derive(Clone)]
pub enum HTMLMacroParserErrorKind
{
	AttributesRequired
	{
		attributes: &'static [(&'static str, Option<&'static str>)],
	},

	InvalidTag
	{
		expected: &'static str,
		found: String,
	},

	BooleanExprExpected,
	AttributeValueIsRequired,
}

// -------------- //
// Implémentation //
// -------------- //

impl HTMLMacro
{
	pub fn parse(
		&self,
		nodes: &[rstml::node::Node],
	) -> Result<Vec<TokenStream2>>
	{
		let mut tokens = vec![];

		for node in nodes {
			use rstml::node::Node;

			let token = match node {
				| Node::Comment(comment_node) => {
					self.parse_comment(comment_node)
				}
				| Node::Doctype(doctype_node) => {
					self.parse_doctype(doctype_node)
				}
				| Node::Fragment(fragment_node) => {
					self.parse_fragment(fragment_node)
				}
				| Node::Element(element_node) => {
					Ok(self.parse_element(element_node)?.into_iter().collect())
				}
				| Node::Block(block_node) => self.parse_block(block_node),
				| Node::Text(text_node) => self.parse_text(text_node),
				| Node::RawText(raw_text) => self.parse_raw_text(raw_text),
			};

			tokens.push(token?);
		}

		Ok(tokens)
	}

	fn parse_comment(
		&self,
		node: &rstml::node::NodeComment,
	) -> Result<TokenStream2>
	{
		let comment = &node.value;
		Ok(quote! {
			Node::create_comment(#comment)
		})
	}

	fn parse_doctype(
		&self,
		node: &rstml::node::NodeDoctype,
	) -> Result<TokenStream2>
	{
		let public_identifier = &node.value.to_string_best();
		Ok(quote! {
			Node::create_doctype(#public_identifier)
		})
	}

	fn parse_fragment(
		&self,
		node: &rstml::node::NodeFragment,
	) -> Result<TokenStream2>
	{
		let html_nodes = self.parse(&node.children)?;
		Ok(tmp::create_fragment(&html_nodes))
	}

	fn parse_element(
		&self,
		node: &rstml::node::NodeElement,
	) -> Result<Vec<TokenStream2>>
	{
		use rstml::node::NodeAttribute;

		let tag_name = node.open_tag.name.to_string();
		let is_void_element = VOID_ELEMENTS.contains(&tag_name.as_str());

		let children = if is_void_element {
			vec![]
		} else {
			self.parse(&node.children)?
		};

		fn filter_custom_attribute(attr: &NodeAttribute) -> bool
		{
			match attr {
				| NodeAttribute::Block(_) => false,
				| NodeAttribute::Attribute(attr) => {
					let key = attr.key.to_string();
					key.parse::<HTMLCustomAttribute>().is_ok()
				}
			}
		}

		fn filter_custom_attribute_m(
			attr: &NodeAttribute,
		) -> Option<(&rstml::node::KeyedAttribute, HTMLCustomAttribute)>
		{
			match attr {
				| NodeAttribute::Block(_) => None,
				| NodeAttribute::Attribute(attr) => {
					let key = attr.key.to_string();
					key.parse::<HTMLCustomAttribute>()
						.map(|custom| (attr, custom))
						.ok()
				}
			}
		}

		let mut tag_attrs: Vec<_> = node
			.attributes()
			.iter()
			.filter(|attr| !filter_custom_attribute(attr))
			.map(|attribute| {
				match attribute {
					| NodeAttribute::Block(block) => {
						quote! {
							Node::from(#[allow(unused_braces)] #block)
						}
					}

					| NodeAttribute::Attribute(attr) => {
						let key = attr.key.to_string();

						let value: Option<(
							&syn::Expr,
							Option<&Box<syn::Type>>,
						)> = attr.value().map(|value_expr| (value_expr, None));

						value.map_or_else(
							|| {
								quote! {(
									#key .to_string(),
									None
								)}
							},
							|(value, ty)| {
								ty.map_or_else(
									|| tmp::create_attribute(&key, value),
									|ty| {
										tmp::create_attribute_from(
											ty, &key, value,
										)
									},
								)
							},
						)
					}
				}
			})
			.collect();

		let contains_custom_attrs: Vec<_> = node
			.attributes()
			.iter()
			.filter_map(|attr| filter_custom_attribute_m(attr))
			.map(|(attr, custom_attr)| {
				match custom_attr {
					| HTMLCustomAttribute::MaybeIf => {
						self.handle_maybe_if_attribute(
							&tag_name,
							&mut tag_attrs,
							&children,
							attr,
						)
					}
					| HTMLCustomAttribute::MaybeOption => {
						self.handle_maybe_option_attribute(
							&tag_name, &tag_attrs, &children, attr,
						)
					}
					| HTMLCustomAttribute::MaybeResult => {
						self.handle_maybe_result_attribute(
							&tag_name, &tag_attrs, &children, attr,
						)
					}

					| HTMLCustomAttribute::ForLet => {
						self.handle_for_let_attribute(
							&tag_name, &tag_attrs, &children, attr,
						)
					}
					| HTMLCustomAttribute::If => {
						self.handle_if_attribute(
							&tag_name, &tag_attrs, &children, attr,
						)
					}

					| HTMLCustomAttribute::HrefPatch
					| HTMLCustomAttribute::HrefPost
					| HTMLCustomAttribute::HrefPut
					| HTMLCustomAttribute::HrefDelete => {
						self.handle_href_method_attribute(
							node,
							&tag_name,
							tag_attrs.as_mut(),
							attr,
							custom_attr,
						)
					}
					| HTMLCustomAttribute::HrefInline => {
						self.handle_href_inline_attribute(
							node, &tag_name, &tag_attrs, attr,
						)
					}

					| HTMLCustomAttribute::FormMethod => {
						self.handle_form_method_attribute(
							node,
							&tag_name,
							tag_attrs.as_mut(),
							attr,
						)
					}

					| HTMLCustomAttribute::SrcInline => {
						self.handle_src_inline_attribute(
							node, &tag_name, &tag_attrs, attr,
						)
					}
				}
			})
			.collect();

		if !contains_custom_attrs.is_empty() {
			let mut tokens = vec![];

			for custom_attr in contains_custom_attrs {
				tokens.push(custom_attr?);
			}

			return Ok(tokens);
		}

		let element = tmp::create_element(tag_name, &tag_attrs, &children);

		Ok(vec![element])
	}

	pub fn parse_block(
		&self,
		node: &rstml::node::NodeBlock,
	) -> Result<TokenStream2>
	{
		Ok(quote! {
			Node::from(#[allow(unused_braces)] #node)
		})
	}

	pub fn parse_text(
		&self,
		node: &rstml::node::NodeText,
	) -> Result<TokenStream2>
	{
		let text = &node.value;

		Ok(quote! {
			Node::create_text(#text)
		})
	}

	pub fn parse_raw_text(
		&self,
		raw_text: &rstml::node::RawText,
	) -> Result<TokenStream2>
	{
		let text = raw_text.to_string_best();

		Ok(quote! {
			Node::create_text(#text)
		})
	}

	fn transform_block(
		parser: syn::parse::ParseStream,
	) -> core::result::Result<Option<TokenStream2>, syn::Error>
	{
		let block = parser.parse::<HTMLBlock>()?;

		let tokens = match block {
			| HTMLBlock::UnsafeFor(for_expr) => {
				quote! {
					#for_expr.iter().map(|node| {
						Node::create_unsafe_html(node)
					})
				}
			}
			| HTMLBlock::For(for_expr) => {
				quote! {
					#for_expr . into_iter()
				}
			}

			| HTMLBlock::Echo(text_expr) => {
				quote! {
					std::iter::once(Node::create_text(#text_expr))
				}
			}

			| HTMLBlock::Json(json_expr) => {
				quote! {
					std::iter::once(Node::create_json(
						serde_json::json!(#json_expr)
					))
				}
			}
			| HTMLBlock::JsonPretty(json_expr) => {
				quote! {
					std::iter::once(Node::create_json(
						serde_json::to_string_pretty(&#json_expr)
							.expect("Pretty JSON")
					))
				}
			}

			| HTMLBlock::UnsafeExpr(expr) => {
				quote! {
					std::iter::once(Node::create_unsafe_html(&#expr))
				}
			}
			| HTMLBlock::Expr(expr) => {
				quote! {
					std::iter::once(Node::create_text(#expr))
				}
			}
		};

		Ok(Some(tokens))
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl flex_syn::Parser for HTMLMacro
{
	type Err<'err> = HTMLMacroParserError;
	type Input = HTMLMacroParserInput;

	fn new(input: Self::Input) -> Self
	{
		let config = rstml::ParserConfig::new()
			.always_self_closed_elements({
				<_ as Into<std::collections::HashSet<_>>>::into(VOID_ELEMENTS)
			})
			.transform_block(Self::transform_block);
		let parser = rstml::Parser::new(config);
		Self {
			tokens: input,
			parser,
		}
	}

	fn analyze(&self) -> Result<'_, TokenStream>
	{
		let (nodes, mut diags) = self
			.parser
			.parse_recoverable(self.tokens.clone())
			.split_vec();

		let maybe_html_nodes = self.parse(&nodes);

		let html_node = match maybe_html_nodes.as_deref() {
			| Ok([html_node]) => quote! { #html_node },
			| Ok(html_nodes) => tmp::create_fragment(html_nodes),
			| Err(err) => {
				diags.push(err.span.error(err.to_string()));
				quote! {}
			}
		};

		let errors = diags
			.into_iter()
			.map(diagnostics::Diagnostic::emit_as_expr_tokens);

		let output = quote! {
			{
				#(#errors;)*
				#html_node
			}
		};

		let output = <TokenStream2 as Into<TokenStream>>::into(output);
		Ok(output)
	}
}

impl Parse for HTMLBlock
{
	fn parse(input: syn::parse::ParseStream) -> syn::Result<Self>
	{
		// expr
		if input.peek(Token![unsafe]) && input.peek2(Token![for]) {
			input.parse::<Token![unsafe]>()?;
			input.parse::<Token![for]>()?;

			let for_expr = input.parse::<syn::Expr>()?;
			Ok(Self::UnsafeFor(for_expr))
		} else if input.peek(Token![for]) {
			input.parse::<Token![for]>()?;
			let for_expr = input.parse::<syn::Expr>()?;
			Ok(Self::For(for_expr))
		} else if input.peek(Token![unsafe]) {
			input.parse::<Token![unsafe]>()?;
			let expr = input.parse::<syn::Expr>()?;
			Ok(Self::UnsafeExpr(expr))
		} else if input.peek(kw::echo) {
			input.parse::<kw::echo>()?;
			let text_expr = input.parse::<syn::Expr>()?;
			Ok(Self::Echo(text_expr))
		} else if input.peek(kw::json) {
			input.parse::<kw::json>()?;
			input.parse::<Token![|]>()?;
			let json_expr = input.parse::<syn::Expr>()?;
			Ok(Self::Json(json_expr))
		} else if input.peek(kw::json_pretty) {
			input.parse::<kw::json_pretty>()?;
			input.parse::<Token![|]>()?;
			let json_expr = input.parse::<syn::Expr>()?;
			Ok(Self::JsonPretty(json_expr))
		} else {
			let expr = input.parse::<syn::Expr>()?;
			Ok(Self::Expr(expr))
		}
	}
}

// -------------- //
// Implémentation // -> Error
// -------------- //

impl<'err> flex_syn::ParserError<'err> for HTMLMacroParserError
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

impl std::str::FromStr for HTMLCustomAttribute
{
	// Osef de l'erreur pour le moment.
	type Err = &'static str;

	fn from_str(s: &str) -> std::result::Result<Self, Self::Err>
	{
		Ok(match s.to_ascii_lowercase().as_str() {
			| s if s.contains(":if") => Self::MaybeIf,
			| s if s.starts_with("let-") && s.contains(":option") => {
				Self::MaybeOption
			}
			| s if s.starts_with("let-") && s.contains(":result") => {
				Self::MaybeResult
			}
			| s if s.contains("for-let:") => Self::ForLet,

			| "if" => Self::If,

			| "href:delete" => Self::HrefDelete,
			| "href:inline" => Self::HrefInline,
			| "href:patch" => Self::HrefPatch,
			| "href:post" => Self::HrefPost,
			| "href:put" => Self::HrefPut,

			| "method" => Self::FormMethod,

			| "src:inline" => Self::SrcInline,

			| _ => return Err("attribut HTML non pris en charge"),
		})
	}
}

// -------------- //
// Implémentation // -> Error
// -------------- //

impl error::Error for HTMLMacroParserError {}

impl fmt::Display for HTMLMacroParserError
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		let err_s = match &self.kind {
			| HTMLMacroParserErrorKind::AttributesRequired { attributes } => {
				let attrs: Vec<_> = attributes
					.iter()
					.map(|(k, v)| {
						if let Some(v) = v {
							format!("{k}={v}")
						} else {
							k.to_string()
						}
					})
					.collect();
				format!(
					"Les attributs « `{}` » sont requis.",
					attrs.join("`, `")
				)
			}
			| HTMLMacroParserErrorKind::InvalidTag { expected, found } => {
				format!(
					"Une balise « {} » est attendue; trouvée: « {} »",
					expected, found
				)
			}
			| HTMLMacroParserErrorKind::BooleanExprExpected => {
				String::from("Une expression booléenne est attendue.")
			}
			| HTMLMacroParserErrorKind::AttributeValueIsRequired => {
				String::from("Une valeur est obligatoire pour l'attribut.")
			}
		};

		write!(f, "`html!` macro: {}", err_s)
	}
}

mod kw
{
	syn::custom_keyword!(echo);
	syn::custom_keyword!(json);
	syn::custom_keyword!(json_pretty);
}

mod tmp
{
	use syn::spanned::Spanned;

	use super::*;

	#[inline(always)]
	pub fn create_fragment(
		elements: &[impl syn::__private::ToTokens],
	) -> TokenStream2
	{
		quote! {
			Node::create_fragment(vec![#(#elements),*])
		}
	}

	#[inline(always)]
	pub fn create_element(
		tag_name: impl syn::__private::ToTokens,
		tag_attrs: &[impl syn::__private::ToTokens],
		children: &[impl syn::__private::ToTokens],
	) -> TokenStream2
	{
		quote! {
			Node::create_element(
				#tag_name,
				vec![#(#tag_attrs),*],
				vec![#(#children),*],
			)
		}
	}

	#[inline(always)]
	pub fn create_element_option(
		tag_name: impl syn::__private::ToTokens,
		tag_attrs: &[impl syn::__private::ToTokens],
		children: &[impl syn::__private::ToTokens],
		attr_name: &str,
		attr_maybe: Option<&syn::Expr>,
	) -> TokenStream2
	{
		let ident =
			syn::Ident::new_raw(attr_name, tag_name.to_token_stream().span());
		quote! {
			{
				if let Some(#ident) = #attr_maybe {
					Node::create_element(
						#tag_name,
						vec![#(#tag_attrs),*],
						vec![#(#children),*],
					)
				} else {
					Node::create_fragment(Default::default())
				}
			}
		}
	}

	#[inline(always)]
	pub fn create_element_result(
		tag_name: impl syn::__private::ToTokens,
		tag_attrs: &[impl syn::__private::ToTokens],
		children: &[impl syn::__private::ToTokens],
		attr_name: &str,
		attr_maybe: Option<&syn::Expr>,
	) -> TokenStream2
	{
		let ident =
			syn::Ident::new_raw(attr_name, tag_name.to_token_stream().span());
		quote! {
			{
				if let Ok(#ident) = #attr_maybe {
					Node::create_element(
						#tag_name,
						vec![#(#tag_attrs),*],
						vec![#(#children),*],
					)
				} else {
					Node::create_fragment(Default::default())
				}
			}
		}
	}

	#[inline(always)]
	pub fn create_void_element(
		tag_name: impl syn::__private::ToTokens,
		tag_attrs: &[impl syn::__private::ToTokens],
	) -> TokenStream2
	{
		quote! {
			Node::create_void_element(
				#tag_name,
				vec![#(#tag_attrs),*],
			)
		}
	}

	#[inline(always)]
	pub fn create_attribute(
		key: impl syn::__private::ToTokens,
		value: impl syn::__private::ToTokens,
	) -> TokenStream2
	{
		quote! {
			(
				#key .to_string(),
				Some( #value .to_string() )
			)
		}
	}

	#[inline(always)]
	pub fn create_attribute_bool(
		key: impl syn::__private::ToTokens,
		value: impl syn::__private::ToTokens,
	) -> TokenStream2
	{
		quote! {
			#[allow(unused_parens)]
			if #value {
				(
					#key .to_string(),
					Some( #key .to_string() )
				)
			} else {
				(
					Default::default(),
					Default::default()
				)
			}
		}
	}

	#[inline(always)]
	pub fn create_attribute_from(
		ty: impl syn::__private::ToTokens,
		key: impl syn::__private::ToTokens,
		value: impl syn::__private::ToTokens,
	) -> TokenStream2
	{
		quote! {
			(
				#key .to_string(),
				Option::<#ty>::from( #value .to_string() )
			)
		}
	}
}
