// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::client::{
	ClientID,
	ClientInterface,
	ClientSocketInterface,
	Origin,
	Socket,
};
use flex_chat::macros::command_response;

use crate::features::users::dto::UserSessionDTO;

command_response! {
	struct UPGRADE_USER<'n>
	{
		/// Ancien ID du client à mettre à jour
		old_client_id: ClientID,
		/// Nouvel ID du client à mettre à jour
		new_client_id: ClientID,
		/// Ancien pseudonyme
		old_nickname: &'n str,
		/// Nouveau pseudonyme
		new_nickname: &'n str,
		user_session: Option<&'n UserSessionDTO>,
	}
}

// --------- //
// Interface //
// --------- //

pub trait IdentifyCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client la réponse liée à la commande /AUTH IDENTIFY.
	fn emit_upgrade_user(
		&self,
		channel_name: &str,
		old_user_id: <Self::Client as ClientInterface>::ClientID,
		new_user_id: <Self::Client as ClientInterface>::ClientID,
		old_nickname: &str,
		new_nickname: &str,
		user_session: Option<&UserSessionDTO>,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> IdentifyCommandResponseInterface for Socket<'s>
{
	fn emit_upgrade_user(
		&self,
		channel_name: &str,
		old_user_id: <Self::Client as ClientInterface>::ClientID,
		new_user_id: <Self::Client as ClientInterface>::ClientID,
		old_nickname: &str,
		new_nickname: &str,
		user_session: Option<&UserSessionDTO>,
	)
	{
		let origin = Origin::from(self.client());

		let upgrade_user = UpgradeUserCommandResponse {
			origin: &origin,
			tags: UpgradeUserCommandResponse::default_tags(),
			old_client_id: old_user_id,
			new_client_id: new_user_id,
			old_nickname,
			new_nickname,
			user_session,
		};

		let channel_room = format!("channel:{}", channel_name);
		self.emit_within(channel_room, upgrade_user.name(), upgrade_user);
	}
}
