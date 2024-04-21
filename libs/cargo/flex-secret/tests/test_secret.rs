// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

#[test]
fn test_secret_default()
{
	let mut secret = flex_secret::Secret::default();
	assert_eq!(secret, "");
	secret.set("hello world");
	assert_eq!(secret, "hello world");
}

#[test]
fn test_secret_expose()
{
	let secret = flex_secret::Secret::new("hello world");
	assert_eq!(*secret.expose(), "hello world");
}

#[test]
fn test_secret_redacted()
{
	let secret = flex_secret::Secret::new("hello world");
	assert_eq!(secret.redacted(), "*****");
}

#[test]
fn test_secret_to_string()
{
	let secret = flex_secret::Secret::new("hello world");
	assert_eq!(secret.to_string(), "*****");
}

#[test]
fn test_secret_eq()
{
	let secret1 = flex_secret::Secret::new("hello world");
	let secret2 = flex_secret::Secret::new("hello world");

	assert_eq!(secret1, "hello world");
	assert_eq!(secret2, secret1);
}
