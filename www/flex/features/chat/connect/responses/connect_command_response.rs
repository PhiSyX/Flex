// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{
	ClientInterface,
	ClientSocketInterface,
	Origin,
	Socket,
};
use flex_chat_user::UserInterface;
use flex_web_framework::types::time;

use super::{RplCreatedReply, RplWelcomeReply, RplYourhostReply};

// --------- //
// Interface //
// --------- //

pub trait ConnectClientSocketCommandResponseInterface
	: ClientSocketInterface
{
	/// Émet au client les réponses de connexion. 3) RPL_CREATED
	fn send_rpl_created(&self, created_at: time::DateTime<time::Utc>)
	{
		let origin = Origin::from(self.client());
		let created_003 = RplCreatedReply {
			origin: &origin,
			date: &created_at,
			tags: RplCreatedReply::default_tags(),
		};
		self.emit(created_003.name(), created_003);
	}

	/// Émet au client les réponses de connexion. 2) RPL_YOURHOST
	fn send_rpl_yourhost(&self, servername: &str)
	{
		let origin = Origin::from(self.client());
		let program_version = format!("v{}", env!("CARGO_PKG_VERSION"));
		let yourhost_002 = RplYourhostReply {
			origin: &origin,
			servername,
			version: &program_version,
			tags: RplYourhostReply::default_tags(),
		};
		self.emit(yourhost_002.name(), yourhost_002);
	}

	/// Émet au client les réponses de connexion. 1) RPL_WELCOME
	fn send_rpl_welcome(&self)
	{
		let origin = Origin::from(self.client());
		let host = self.user().host().to_string();
		let welcome_001 = RplWelcomeReply {
			origin: &origin,
			nickname: self.user().nickname(),
			ident: self.user().ident(),
			host: &host,
			tags: RplWelcomeReply::default_tags(),
		}
		.with_tags([("client_id", self.client().cid())])
		.with_tags([("token", self.client().token())]);

		self.emit(welcome_001.name(), welcome_001);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ConnectClientSocketCommandResponseInterface for Socket<'s> {}
