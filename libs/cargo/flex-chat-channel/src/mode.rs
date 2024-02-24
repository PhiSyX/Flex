// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod access_control;
mod access_level;
mod settings;

use std::collections::HashMap;
use std::ops;

use flex_chat_mode::ApplyMode;

pub use self::access_control::*;
pub use self::access_level::*;
pub use self::settings::*;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(Debug)]
pub struct ChannelModes<F>
{
	/// Les modes de salon.
	modes: HashMap<String, ApplyMode<F>>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<T> ops::Deref for ChannelModes<T>
{
	type Target = HashMap<String, ApplyMode<T>>;

	fn deref(&self) -> &Self::Target
	{
		&self.modes
	}
}

impl<T> ops::DerefMut for ChannelModes<T>
{
	fn deref_mut(&mut self) -> &mut Self::Target
	{
		&mut self.modes
	}
}
