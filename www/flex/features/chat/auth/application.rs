// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::ChannelsSessionInterface;
use flex_chat_client::{ClientInterface, ClientSocketInterface, Socket};
use flex_chat_user::UserInterface;

use crate::{features::chat::nick::NickClientSessionInterface, ChatApplication};

use super::sessions::AuthClientSessionInterface;

// --------- //
// Interface //
// --------- //

pub trait AuthChatApplicationInterface
{
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Change l'ID d'un client
	fn change_id_of_client(
		&self,
		client_socket: &mut Self::ClientSocket<'_>,
		id: <<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID
	);

	/// Change le pseudonyme d'un client
	fn change_nickname_of_client(
		&self,
		client_socket: &mut Self::ClientSocket<'_>,
		nickname: &str
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl AuthChatApplicationInterface for ChatApplication
{
	type ClientSocket<'cs> = Socket<'cs>;

	fn change_id_of_client(
		&self,
		client_socket: &mut Self::ClientSocket<'_>,
		id: <<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID
	)
	{
		for channel_room in client_socket.channels_rooms() {
			let channel_id = &channel_room["channel:".len()..];
			self.channels.remove_member(channel_id, client_socket.cid());
			self.channels.add_member(channel_id, &id);
		}

		self.clients.change_client_id(client_socket.cid(), id);
		client_socket.set_cid(id);
		client_socket.client_mut().new_token();
	}

	fn change_nickname_of_client(
		&self,
		client_socket: &mut Self::ClientSocket<'_>,
		nickname: &str
	)
	{
		if client_socket.user_mut().set_nickname(nickname).is_err() {
			return;
		}
		self.clients.change_nickname(client_socket.cid(), nickname);
	}
}
