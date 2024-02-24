// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod access_control_interface;
mod member_interface;
mod session_interface;
mod settings_interface;
mod topic_interface;

pub use self::access_control_interface::*;
pub use self::member_interface::*;
pub use self::session_interface::*;
pub use self::settings_interface::*;
pub use self::topic_interface::*;

// --------- //
// Interface //
// --------- //

pub trait ChannelInterface:
	ChannelAccessControlInterface
	+ ChannelMemberInterface
	+ ChannelSettingsInterface
	+ ChannelTopicInterface
{
	/// Type représentant l'ID d'un salon.
	type OwnedID: ToString + Clone;
	type RefID<'a>: ?Sized + 'a + ToOwned<Owned = Self::OwnedID>
	where
		Self: 'a;

	/// Type représentant la clé d'un salon.
	type Key: ToString;

	/// ID du salon.
	fn id(&self) -> Self::OwnedID;

	/// Nom du salon.
	fn name(&self) -> &Self::RefID<'_>;

	// TODO: à déplacer?
	// Chambre Socket.
	fn room(&self) -> String
	{
		format!("channel:{}", self.id().to_string())
	}
}
