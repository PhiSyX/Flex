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

use flex_chat_channel::{
	Channel,
	ChannelAccessControlInterface,
	ChannelInterface,
	ChannelMember,
	ChannelsSessionInterface,
	MemberInterface,
};
use flex_chat_client::{
	ClientServerApplicationInterface,
	ClientSocketInterface,
	ClientsChannelSessionInterface,
	ClientsSessionInterface,
	Socket,
};
use flex_chat_client_channel::ChannelClientSocketCommandResponse;

use super::{
	JoinChannelPermissionError,
	JoinChannelsSessionInterface,
	JoinCommandResponseInterface,
	JoinErrorResponseInterface,
};
use crate::features::chat::mode::{
	ChannelMemberDTO,
	ModeAccessControlClientSocketCommandResponseInterface,
	ModeChannelSettingsClientSocketCommandResponseInterface,
};
use crate::features::chat::topic::TopicClientSocketInterface;
use crate::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait JoinApplicationInterface<'a>
{
	type ClientSocket<'cs>: JoinCommandResponseInterface
						  + JoinErrorResponseInterface
						  ;
	type Channel: ChannelInterface + 'a;

	/// Rejoint un salon du serveur.
	fn join_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel: &mut Self::Channel,
		forced: bool,
	);

	/// Rejoint un salon du serveur ou le crée.
	fn join_or_create_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: impl Into<
			Cow<'a, <Self::Channel as ChannelInterface>::RefID<'a>>,
		>,
		channel_key: Option<&<Self::Channel as ChannelInterface>::Key>,
	) -> Result<(), JoinChannelPermissionError>;

	/// Rejoint un salon du serveur ou le crée. Aucune vérification concernant
	/// la clé n'est faite. Cela veut dire que cette méthode peut joindre un
	/// salon même si le salon possède une clé. Cette méthode est généralement
	/// utilisé lorsqu'un opérateur global (GLOBOP) utilise la commande /SAJOIN
	/// OU qu'un utilisateur se fait inviter via la commande /INVITE par les
	/// membres d'un salon.
	fn join_or_create_channel_bypass_permission(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: impl Into<
			Cow<'a, <Self::Channel as ChannelInterface>::RefID<'a>>,
		>,
	) -> Result<(), JoinChannelPermissionError>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'a> JoinApplicationInterface<'a> for ChatApplication
{
	type Channel = Channel;
	type ClientSocket<'s> = Socket<'s>;

	fn join_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel: &mut Self::Channel,
		forced: bool,
	)
	{
		self.clients.add_channel_on_client(client_socket.cid(), &channel.id());

		client_socket.emit_join(channel, forced);

		// NOTE: Émettre le sujet du salon au client courant.
		client_socket.send_rpl_topic(channel, false);

		// NOTE: Émettre les paramètres du salon au client courant.
		client_socket.emit_all_channels_settings(channel, false);

		// NOTE: Émettre au client courant les membres du salon.
		let map_member = |member: &ChannelMember| -> Option<ChannelMemberDTO> {
			let client = self.clients.get(member.id())?;
			Some(ChannelMemberDTO::from((client, member)))
		};
		client_socket.send_rpl_namreply(channel, map_member);

		channel.remove_invite(client_socket.cid());

		client_socket.emit_all_channel_access_control(channel);
	}

	fn join_or_create_channel(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: impl Into<
			Cow<'a, <Self::Channel as ChannelInterface>::RefID<'a>>,
		>,
		channel_key: Option<&<Self::Channel as ChannelInterface>::Key>,
	) -> Result<(), JoinChannelPermissionError>
	{
		type C<'a, Chan> = <Chan as ChannelInterface>::RefID<'a>;
		let channel_name:& C<'a, Self::Channel> = &channel_name.into();

		if !self.channels.has(channel_name) {
			self.channels.create(channel_name, channel_key.cloned());
			let mut channel = self.channels.add_member(
				channel_name,
				client_socket.cid(),
			)
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &mut channel, false);
			return Ok(());
		}

		let client_session = self.get_client_by_id(client_socket.cid()).unwrap();
		let can_join = self.channels.can_join(
			&client_session,
			channel_name, channel_key,
		);

		if can_join.is_ok() {
			let mut channel = self.channels.add_member(
				channel_name,
				client_socket.cid(),
			)
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &mut channel, false);
			return Ok(());
		}

		can_join
	}

	fn join_or_create_channel_bypass_permission(
		&self,
		client_socket: &Self::ClientSocket<'_>,
		channel_name: impl Into<
			Cow<'a, <Self::Channel as ChannelInterface>::RefID<'a>>,
		>,
	) -> Result<(), JoinChannelPermissionError>
	{
		type C<'a, Chan> = <Chan as ChannelInterface>::RefID<'a>;
		let channel_name:& C<'a, Self::Channel> = &channel_name.into();

		if !self.channels.has(channel_name) {
			self.channels.create(channel_name, None);
			let mut channel = self.channels.add_member(
				channel_name,
				client_socket.cid(),
			)
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &mut channel, true);
			return Ok(());
		}

		let client_session = self.get_client_by_id(client_socket.cid()).unwrap();
		let can_join = self.channels.can_join(&client_session, channel_name, None);

		if let Err(JoinChannelPermissionError::ERR_USERONCHANNEL) = &can_join {
			return can_join;
		}

		let mut channel = self.channels.add_member(channel_name, client_socket.cid())
			.expect("Le salon que le client a rejoint");
		self.join_channel(client_socket, &mut channel, true);

		can_join
	}
}
