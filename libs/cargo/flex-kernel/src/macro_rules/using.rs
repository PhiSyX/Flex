// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/**
 * @example
 *
 * using! {
 *    pub name1,
 *    pub(crate) name2,
 *    pub(super) name3,
 *    name4,
 * }
 *
 * @example
 *
 * using! {
 *               dir1 / { file1,  pub file2,  pub(crate) file3,  pub(super)
 * file4  };    pub        dir2 / { file5,  pub file6,  pub(crate) file7,
 * pub(super) file8  };    pub(crate) dir3 / { file9,  pub file10,
 * pub(crate) file11, pub(super) file12 };    pub(super) dir4 / { file13,
 * pub file14, pub(crate) file15, pub(super) file16 }; }
 */
#[macro_export]
macro_rules! using {
	($($vis:vis $name:ident,)*) => {
		$($vis mod $name ;)*
		$($vis use self:: $name :: *;)*
	};

	($($vis:vis $directory:ident / { $($module_vis:vis $name:ident,)* };)*) => {
		$(
			$vis mod $directory {
				$(mod $name ;)*
				$($module_vis use self:: $name ::*;)*
			}
		)*
		$($vis use self:: $directory ::*;)*
	};
}

/**
 * @example
 *
 * public_using! {
 *    name,
 * }
 *
 * @example
 *
 * public_using! {
 *    dir / { file };
 * }
 */
#[macro_export]
macro_rules! public_using {
	($($name:ident,)*) => {
		$crate::using! { $(pub $name,)* }
	};

	($($directory:ident / { $($name:ident,)* };)*) => {
		$crate::using! { $(pub $directory / { $( pub $name,)* };)* }
	};
}
