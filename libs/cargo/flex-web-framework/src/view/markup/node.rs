// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use core::fmt;
use std::path;
use std::sync::LazyLock;
use std::time::SystemTime;

use dashmap::DashMap;

mod comment;
mod doctype;
mod element;
mod fragment;
mod text;

// ------ //
// Static //
// ------ //

static MEMOIZE_FILE: LazyLock<DashMap<path::PathBuf, MemoizeFile>> =
	LazyLock::new(DashMap::new);

// ----------- //
// Énumération //
// ----------- //

pub enum Node
{
	/// Commentaire HTML.
	Comment(comment::CommentNode),
	/// Type de document HTML.
	Doctype(doctype::DoctypeNode),
	/// Fragments HTML.
	Fragment(fragment::FragmentNode),
	/// Elements HTML.
	Element(element::ElementNode),
	/// Noeud texte.
	Text(text::TextNode),
	/// Noeud texte (json).
	Json(text::JsonTextNode),
	/// Noeud texte non sûr
	UnsafeHtml(text::DangerousTextNode),
}

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
pub struct MemoizeFile
{
	content: String,
	modified_at: SystemTime,
}

// -------------- //
// Implémentation //
// -------------- //

// Comment
impl Node
{
	pub fn create_comment(comment: impl ToString) -> Self
	{
		Self::Comment(comment::CommentNode {
			content: comment.to_string(),
		})
	}
}

// Doctype
impl Node
{
	pub fn create_doctype(public_identifier: impl ToString) -> Self
	{
		Self::Doctype(doctype::DoctypeNode {
			public_identifier: public_identifier.to_string(),
		})
	}
}

// Fragment
impl Node
{
	pub fn create_fragment(children: Vec<Node>) -> Self
	{
		Self::Fragment(fragment::FragmentNode { children })
	}
}

// Element
impl Node
{
	pub fn create_element(
		tag_name: impl ToString,
		attributes: Vec<(String, Option<String>)>,
		children: Vec<Node>,
	) -> Self
	{
		let children = if children.is_empty() {
			None
		} else {
			Some(children)
		};
		Self::Element(element::ElementNode {
			tag_name: tag_name.to_string(),
			attributes,
			children,
		})
	}

	pub fn create_void_element(
		tag_name: impl ToString,
		attributes: Vec<(String, Option<String>)>,
	) -> Self
	{
		Self::Element(element::ElementNode {
			tag_name: tag_name.to_string(),
			attributes,
			children: None,
		})
	}
}

// Text
impl Node
{
	pub fn create_text(text: impl ToString) -> Self
	{
		Self::Text(text::TextNode {
			text: text.to_string(),
		})
	}

	pub fn create_json(text: impl ToString) -> Self
	{
		Self::Json(text::JsonTextNode {
			text: text.to_string(),
		})
	}
}

// Unsafe HTML
impl Node
{
	pub fn create_unsafe_html(raw_text: impl ToString) -> Self
	{
		Self::UnsafeHtml(text::DangerousTextNode {
			raw_text: raw_text.to_string(),
		})
	}

	pub fn create_unsafe_html_cached(
		named: impl AsRef<path::Path>,
		fallback: impl FnOnce() -> String,
	) -> Self
	{
		let modified_at =
			named.as_ref().metadata().unwrap().modified().unwrap();

		if let Some(memfile) = MEMOIZE_FILE.get(named.as_ref()) {
			if memfile.modified_at == modified_at {
				return Self::UnsafeHtml(text::DangerousTextNode {
					raw_text: memfile.content.to_owned(),
				});
			}
			drop(memfile);
		}

		let content = fallback();

		let memfile = MemoizeFile {
			content: content.clone(),
			modified_at,
		};

		MEMOIZE_FILE.insert(named.as_ref().to_owned(), memfile);

		Self::UnsafeHtml(text::DangerousTextNode { raw_text: content })
	}

	pub fn create_unsafe_html_from_file(file: impl AsRef<path::Path>) -> Self
	{
		let modified_at = file.as_ref().metadata().unwrap().modified().unwrap();

		if let Some(memfile) = MEMOIZE_FILE.get(file.as_ref()) {
			if memfile.modified_at == modified_at {
				return Self::UnsafeHtml(text::DangerousTextNode {
					raw_text: memfile.content.to_owned(),
				});
			}
			drop(memfile);
		}

		let raw_text = std::fs::read_to_string(&file).unwrap_or_else(|_| {
			panic!("le fichier « {} » n'existe pas.", file.as_ref().display())
		});

		let memfile = MemoizeFile {
			content: raw_text.clone(),
			modified_at,
		};

		MEMOIZE_FILE.insert(file.as_ref().to_owned(), memfile);

		Self::UnsafeHtml(text::DangerousTextNode { raw_text })
	}
}

// -------- //
// Fonction //
// -------- //

fn with_children(
	f: &mut fmt::Formatter<'_>,
	children: &[Node],
	is_fragment: bool,
) -> fmt::Result
{
	if f.alternate() {
		let mut children = children.iter();

		if is_fragment {
			if let Some(first_child) = children.next() {
				write!(f, "{first_child:#}")?;

				for child in children {
					write!(f, "\n{child:#}")?;
				}
			}
		} else {
			for child in children.map(|child| format!("{child:#}")) {
				for line in child.lines() {
					write!(f, "\n\t{line}")?;
				}
			}
			writeln!(f)?;
		}
	} else {
		use std::fmt::Display;

		for child in children {
			child.fmt(f)?;
		}
	}

	Ok(())
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Default for Node
{
	fn default() -> Self
	{
		Self::create_fragment(vec![])
	}
}

impl fmt::Display for Node
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		match &self {
			| Self::Comment(comment) => comment.fmt(f),
			| Self::Doctype(doctype) => doctype.fmt(f),
			| Self::Fragment(fragment) => fragment.fmt(f),
			| Self::Element(element) => element.fmt(f),
			| Self::Text(text) => text.fmt(f),
			| Self::Json(text) => text.fmt(f),
			| Self::UnsafeHtml(danger) => danger.fmt(f),
		}
	}
}

impl<It, F> From<It> for Node
where
	It: IntoIterator<Item = F>,
	F: Into<Self>,
{
	fn from(it: It) -> Self
	{
		Self::Fragment(it.into())
	}
}

impl From<comment::CommentNode> for Node
{
	fn from(comment_node: comment::CommentNode) -> Self
	{
		Self::Comment(comment_node)
	}
}

impl From<doctype::DoctypeNode> for Node
{
	fn from(doctype_node: doctype::DoctypeNode) -> Self
	{
		Self::Doctype(doctype_node)
	}
}

impl From<fragment::FragmentNode> for Node
{
	fn from(fragment_node: fragment::FragmentNode) -> Self
	{
		Self::Fragment(fragment_node)
	}
}

impl From<element::ElementNode> for Node
{
	fn from(element_node: element::ElementNode) -> Self
	{
		Self::Element(element_node)
	}
}

impl From<text::TextNode> for Node
{
	fn from(text_node: text::TextNode) -> Self
	{
		Self::Text(text_node)
	}
}
