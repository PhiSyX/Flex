// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{self, ClientSocketInterface, Socket};
use flex_chat_user::UserInterface;

use super::{
	NickClientSessionInterface, NickClientSocketCommandResponseInterface, NickClientSocketErrorRepliesInterface
};
use crate::features::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait NickApplicationInterface
{
	/// Peut-on localiser un client de session via un pseudonyme ?
	fn can_locate_client_by_nickname(&self, nickname: impl AsRef<str>) -> bool;

	/// Change le pseudonyme d'un client
	fn change_nickname_of_client(&self, client_socket: &mut Socket, nickname: &str);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl NickApplicationInterface for ChatApplication
{
	fn can_locate_client_by_nickname(&self, nickname: impl AsRef<str>) -> bool
	{
		self.clients.can_locate_by_nickname(nickname)
	}

	fn change_nickname_of_client(&self, client_socket: &mut Socket, nickname: &str)
	{
		if let Err(error) = client_socket.user_mut().set_nickname(nickname) {
			tracing::error!(?error, "Changement de pseudonyme impossible");
			client_socket.send_err_erroneusnickname(nickname);
			return;
		}

		self.clients.change_nickname(client_socket.cid(), nickname);

		client_socket.emit_nick();
	}
}
