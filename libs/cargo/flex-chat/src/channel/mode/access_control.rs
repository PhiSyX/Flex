// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::{HashMap, HashSet};

use crate::mode::{ApplyMode, Mask};

// -------- //
// Constant //
// -------- //

pub const CHANNEL_MODE_LIST_BAN: char = 'b';
pub const CHANNEL_MODE_LIST_BAN_EXCEPT: char = 'e';

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(Default)]
#[derive(Debug)]
pub struct AccessControl
{
	/// Les utilisateurs bannis du salon.
	pub banlist: HashMap<String, ApplyMode<AccessControlMask>>,
	/// Les exceptions de bannissement du salon.
	pub banlist_exceptions: HashMap<String, ApplyMode<AccessControlMask>>,
	/// Les utilisateurs en attente dans la liste des invitations.
	pub invite_list: HashSet<uuid::Uuid>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(PartialEq, Eq)]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct AccessControlMask
{
	pub mask: Mask,
}

// -------------- //
// Implémentation //
// -------------- //

impl AccessControlMask
{
	pub fn new(mask: Mask) -> Self
	{
		Self { mask }
	}
}

impl AccessControl
{
	pub fn add_ban(
		&mut self,
		mask: impl Into<Mask>,
		mode: ApplyMode<AccessControlMask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let mask = mask.into();
		let mask_key = mask.to_string();

		if self.banlist.contains_key(&mask_key) {
			return None;
		}

		self.banlist.insert(mask_key, mode.clone());

		Some(mode)
	}

	pub fn add_ban_except(
		&mut self,
		mask: impl Into<Mask>,
		mode: ApplyMode<AccessControlMask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let mask = mask.into();
		let mask_key = mask.to_string();

		if self.banlist_exceptions.contains_key(&mask_key) {
			return None;
		}

		self.banlist_exceptions.insert(mask_key, mode.clone());

		Some(mode)
	}

	pub fn remove_ban(
		&mut self,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let mask = mask.into();
		let mask_key = mask.to_string();
		self.banlist.remove(&mask_key)
	}

	pub fn remove_ban_except(
		&mut self,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let mask = mask.into();
		let mask_key = mask.to_string();
		self.banlist_exceptions.remove(&mask_key)
	}
}
