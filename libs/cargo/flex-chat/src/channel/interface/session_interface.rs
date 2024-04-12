// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::borrow::Cow;

use dashmap::mapref::one::{Ref, RefMut};
use flex_secret::Secret;

use crate::channel::{
	ChannelInterface,
	ChannelMemberInterface,
	ChannelSettingsInterface,
	MemberInterface,
};
use crate::mode::ApplyMode;

// --------- //
// Interface //
// --------- //

pub trait ChannelsSessionInterface
{
	/// Type représentant un salon.
	#[rustfmt::skip]
	type Channel
		: ChannelInterface
		+ ChannelMemberInterface
		;

	/// Ajoute un nouveau salon.
	fn add(
		&self,
		channel_id: <Self::Channel as ChannelInterface>::OwnedID,
		channel: Self::Channel,
	) -> bool;

	fn add_member(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: <
			<Self::Channel as ChannelMemberInterface>::Member as MemberInterface
		>::ID,
	) -> Option<RefMut<'_, String, Self::Channel>>;

	/// Crée un salon.
	fn create(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		channel_key: Option<<Self::Channel as ChannelInterface>::Key>,
	) -> bool;

	/// Crée un salon avec des drapeaux.
	fn create_with_flags<'a>(
		&self,
		channel_name: impl Into<
			Cow<'a, <Self::Channel as ChannelInterface>::RefID<'a>>,
		>,
		channel_key: Option<Secret<String>>,
		flags: impl IntoIterator<
			Item = ApplyMode<
				<Self::Channel as ChannelSettingsInterface>::SettingsFlag,
			>,
		>,
	) -> bool
	where
		<Self as ChannelsSessionInterface>::Channel: 'a;

	/// Récupère un salon enregistré en session.
	fn get(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> Option<
		Ref<'_, <Self::Channel as ChannelInterface>::OwnedID, Self::Channel>,
	>;

	/// Récupère un salon enregistré en session (version mutable).
	fn get_mut(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> Option<
		RefMut<'_, <Self::Channel as ChannelInterface>::OwnedID, Self::Channel>,
	>;

	/// Récupère un client d'un salon.
	fn get_member(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<
			<Self::Channel as ChannelMemberInterface>::Member as MemberInterface
		>::ID,
	) -> Option<<Self::Channel as ChannelMemberInterface>::Member>;

	/// Vérifie qu'un salon est existant ou non.
	fn has(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> bool;

	/// Vérifie qu'un membre est présent dans un salon.
	fn has_member(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
	) -> bool;

	/// Liste des salons crées depuis le début de la session.
	fn list(
		&self,
	) -> dashmap::iter::Iter<
		'_,
		<Self::Channel as ChannelInterface>::OwnedID,
		Self::Channel,
	>;

	/// Supprime un salon.
	fn remove(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> Option<(<Self::Channel as ChannelInterface>::OwnedID, Self::Channel)>;

	/// Supprime un membre d'un salon. Supprime le salon s'il n'y a plus aucun
	/// membres dedans.
	fn remove_member_and_channel_if_empty(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
	) -> Option<()>;

	/// Supprime un membre d'un salon.
	fn remove_member(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
	) -> Option<()>;
}
