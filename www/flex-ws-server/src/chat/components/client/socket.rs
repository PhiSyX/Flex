// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::time;

use crate::src::chat::components;
use crate::src::chat::components::client::origin::Origin;
use crate::src::chat::features::ApplyMode;

// --------- //
// Interface //
// --------- //

pub trait ClientSocketInterface
{
	fn client(&self) -> &super::Client;
	fn client_mut(&mut self) -> &mut super::Client;

	fn disconnect(self);

	fn broadcast<E, S>(&self, event: E, data: S)
	where
		E: ToString + std::fmt::Display,
		S: serde::Serialize + std::fmt::Debug,
	{
		log::debug!("[BROADCAST] {event} {:#?}", &data);
		_ = self.socket().broadcast().emit(event.to_string(), data);
	}

	fn emit<E, S>(&self, event: E, data: S)
	where
		E: ToString + std::fmt::Display,
		S: serde::Serialize + std::fmt::Debug,
	{
		log::debug!("{event} {:#?}", &data);
		_ = self.socket().emit(event.to_string(), data);
	}

	fn emit_to<T, E, S>(&self, to: T, event: E, data: S)
	where
		T: ToString + std::fmt::Display,
		E: ToString + std::fmt::Display,
		S: serde::Serialize + std::fmt::Debug,
	{
		log::debug!("> {event} {:#?} ({to})", &data);
		_ = self
			.socket()
			.to(to.to_string())
			.emit(event.to_string(), data);
	}

	fn emit_within<T, E, S>(&self, to: T, event: E, data: S)
	where
		T: ToString + std::fmt::Display,
		E: ToString + std::fmt::Display,
		S: serde::Serialize + std::fmt::Debug,
	{
		log::debug!("> {event} {:#?} ({to})", &data);
		_ = self
			.socket()
			.within(to.to_string())
			.emit(event.to_string(), data);
	}

	fn socket(&self) -> &socketioxide::extract::SocketRef;
	fn user(&self) -> &crate::src::chat::components::User;
	fn user_mut(&mut self) -> &mut crate::src::chat::components::User;
}

pub trait ClientSocketCommunication {}

// ----------- //
// Énumération //
// ----------- //

pub enum Socket<'a>
{
	Owned
	{
		socket: socketioxide::extract::SocketRef,
		client: Box<super::Client>,
	},
	Borrowed
	{
		socket: &'a socketioxide::extract::SocketRef,
		client: socketioxide::extensions::Ref<'a, super::Client>,
	},
	BorrowedMut
	{
		socket: &'a socketioxide::extract::SocketRef,
		client: socketioxide::extensions::RefMut<'a, super::Client>,
	},
}

// -------------- //
// Implémentation //
// -------------- //

impl<'a> Socket<'a>
{
	/// Les salons de la socket.
	pub fn channels_rooms(&self) -> Vec<String>
	{
		self.socket()
			.rooms()
			.iter()
			.flatten()
			.filter_map(|room| room.starts_with("channel:").then_some(room.to_string()))
			.collect()
	}

	/// Vérifie si le pseudonyme donné est le même que celui sauvegardé dans
	/// l'instance du client courant.
	pub fn check_nickname(&self, nickname: &str) -> bool
	{
		self.user().is_me(nickname)
	}

	/// ID du client courant.
	pub fn cid(&self) -> &super::ClientID
	{
		self.client().id()
	}

	/// ID du socket courante.
	pub fn sid(&self) -> Option<socketioxide::socket::Sid>
	{
		self.client().sid()
	}

	/// La chambre des ignorés/bloqués du client courant.
	pub fn useless_people_room(&self) -> String
	{
		format!("{}/ignore", self.cid())
	}
}

impl<'a> Socket<'a>
{
	/// Émet au client les réponses liées à la commande /JOIN.
	pub fn emit_join(
		&self,
		channel: &components::Channel,
		forced: bool,
		map_member: impl FnMut(
			&components::nick::ChannelNick,
		) -> Option<crate::src::chat::replies::ChannelNickClient>,
	)
	{
		use crate::src::chat::features::JoinCommandResponse;

		let origin = Origin::from(self.client());

		// NOTE: Émettre la réponse de la commande JOIN à tous les membres de la
		// room, y compris le client courant lui-même.
		let cmd_join = JoinCommandResponse {
			origin: &origin,
			channel: &channel.name,
			forced,
			tags: JoinCommandResponse::default_tags(),
		};

		let channel_room = format!("channel:{}", channel.name.to_lowercase());
		_ = self.socket().join(channel_room.clone());
		self.emit(cmd_join.name(), &cmd_join);
		self.emit_to(channel_room, cmd_join.name(), cmd_join);

		// NOTE: Émettre le sujet du salon au client courant.
		self.send_rpl_topic(channel, false);

		// NOTE: Émettre les paramètres du salon au client courant.
		self.emit_cmodes(channel, false);

		// NOTE: Émettre au client courant les membres du salon.
		self.send_rpl_namreply(channel, map_member);
	}

	/// Émet au client les réponses liées à la commande /KICK.
	pub fn emit_kick(
		&self,
		channel: &components::channel::Channel,
		knick_client_socket: &Self,
		reason: Option<&str>,
	)
	{
		use crate::src::chat::features::KickCommandResponse;

		let origin = Origin::from(self.client());
		let knick_origin = Origin::from(knick_client_socket.client());

		let cmd_kick = KickCommandResponse {
			origin: &origin,
			knick: &knick_origin,
			channel: &channel.name,
			reason: reason.or(Some("Kick!")),
			tags: KickCommandResponse::default_tags(),
		};

		self.emit_within(channel.room(), cmd_kick.name(), cmd_kick);
		_ = knick_client_socket.socket().leave(channel.room());
	}

	/// Émet au client les réponses liées à la commande /KILL.
	pub fn emit_kill(&self, knick_client_socket: &Self, reason: &str)
	{
		use crate::src::chat::features::KillCommandResponse;

		let origin = Origin::from(self.client());
		let knick_origin = Origin::from(knick_client_socket.client());

		let cmd_kill = KillCommandResponse {
			origin: &origin,
			knick: &knick_origin,
			reason,
			tags: KillCommandResponse::default_tags(),
		};

		_ = self
			.socket()
			.within(knick_client_socket.channels_rooms())
			.emit(cmd_kill.name(), cmd_kill);
	}

	/// Émet au client courant les membres avec leurs niveaux d'accès sur un
	/// salon.
	pub fn emit_mode_access_level(
		&self,
		channel: &components::channel::Channel,
		added_flags: Vec<(char, ApplyMode<components::nick::ChannelAccessLevel>)>,
		removed_flags: Vec<(char, ApplyMode<components::nick::ChannelAccessLevel>)>,
		updated: bool,
	)
	{
		use crate::src::chat::features::ModeCommandResponse;

		let origin = Origin::from(self.client());

		let mode = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			added: added_flags,
			removed: removed_flags,
			target: &channel.name,
			updated,
		};
		self.emit_within(channel.room(), mode.name(), mode);
	}

	/// Émet au client courant les paramètres un salon.
	pub fn emit_cmodes(&self, channel: &components::channel::Channel, updated: bool)
	{
		use crate::src::chat::features::ModeCommandResponse;

		let origin = Origin::from(self.client());

		let channel_settings = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			target: &channel.name,
			removed: Default::default(),
			added: channel.settings().into_iter().collect(),
			updated,
		};
		self.emit(channel_settings.name(), channel_settings);
	}

	/// Émet au client les réponses liées à la commande /NICK.
	pub fn emit_nick(&self)
	{
		use crate::src::chat::features::NickCommandResponse;

		let (old_nickname, new_nickname): (&str, &str) = (
			self.user().old_nickname.as_deref().unwrap(),
			self.user().nickname.as_ref(),
		);

		let origin = Origin::from(self.client());

		let cmd_nick = NickCommandResponse {
			origin: &origin,
			tags: NickCommandResponse::default_tags(),
			old_nickname,
			new_nickname,
		}
		.with_tags([("userid", self.cid())]);

		_ = self
			.socket()
			.join(format!("private:{}", new_nickname.to_lowercase()));

		// NOTE: notifier toutes les rooms dont fait partie le client que le
		// pseudonyme du client a été changé.

		self.emit(cmd_nick.name(), &cmd_nick);
		// FIXME(phisyx): À améliorer pour n'envoyer qu'une seul événement à
		// tous les client en communs.
		self.broadcast(cmd_nick.name(), &cmd_nick);

		_ = self
			.socket()
			.leave(format!("private:{}", old_nickname.to_lowercase()));
	}

	/// Émet au client les réponses liées à la commande /PART.
	pub fn emit_part(&self, channel: &str, message: Option<&str>, forced_by: Option<&str>)
	{
		use crate::src::chat::features::PartCommandResponse;

		let origin = Origin::from(self.client());

		let cmd_part = PartCommandResponse {
			origin: &origin,
			channel,
			message,
			forced_by,
			tags: PartCommandResponse::default_tags(),
		};

		let channel_room = format!("channel:{}", channel.to_lowercase());
		self.emit(cmd_part.name(), &cmd_part);
		self.emit_to(channel_room.clone(), cmd_part.name(), cmd_part);
		_ = self.socket().leave(channel_room);
	}

	/// Émet au client les réponses liées à la commande /PRIVMSG <channel>
	pub fn emit_privmsg_to_channel<User>(&self, target: &str, text: &str, by: User)
	where
		User: serde::Serialize,
	{
		use crate::src::chat::features::PrivmsgCommandResponse;

		let privmsg = PrivmsgCommandResponse {
			origin: &by,
			tags: PrivmsgCommandResponse::default_tags(),
			target,
			text,
		};

		_ = self.socket().emit(privmsg.name(), &privmsg);

		let target_room = format!(
			"{}:{}",
			if target.starts_with('#') {
				"channel"
			} else {
				"private"
			},
			target.to_lowercase()
		);

		_ = self
			.socket()
			.except(self.useless_people_room())
			.to(target_room)
			.emit(privmsg.name(), privmsg);
	}

	/// Émet au client les réponses liées à la commande /PRIVMSG <nickname>
	pub fn emit_privmsg_to_nickname<User>(&self, target: &str, text: &str, by: User)
	where
		User: serde::Serialize,
	{
		use crate::src::chat::features::PrivmsgCommandResponse;

		let privmsg = PrivmsgCommandResponse {
			origin: &by,
			target,
			text,
			tags: PrivmsgCommandResponse::default_tags(),
		};

		_ = self.socket().emit(privmsg.name(), &privmsg);
	}

	/// Émet au client les réponses liées à la commande /QUIT.
	pub fn emit_quit(&self, room: &str, reason: impl ToString)
	{
		use crate::src::chat::features::QuitCommandResponse;

		let msg = reason.to_string();

		let origin = Origin::from(self.client());
		let quit_command = QuitCommandResponse {
			origin: &origin,
			tags: QuitCommandResponse::default_tags(),
			message: msg.as_str(),
		};

		self.emit_to(
			format!("channel:{}", room.to_lowercase()),
			quit_command.name(),
			quit_command,
		);
	}

	/// Émet au client les réponses liées à la commande /QUIT.
	pub fn emit_umode(&self, umode: &[ApplyMode<components::user::Flag>])
	{
		use crate::src::chat::features::ModeCommandResponse;

		let origin = Origin::from(self.client());
		let mode_cmd = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			added: umode
				.iter()
				.map(|flag| (flag.letter(), flag.clone()))
				.collect(),
			removed: Default::default(),
			target: &self.user().nickname,
			updated: false,
		};

		self.emit(mode_cmd.name(), mode_cmd);
	}

	/// Émet au client les réponses liées à la commande /QUIT.
	pub fn emit_umodes(&self)
	{
		let umodes: Vec<(char, ApplyMode<components::user::Flag>)> = self.user().flags().collect();

		if umodes.is_empty() {
			return;
		}

		use crate::src::chat::features::ModeCommandResponse;

		let origin = Origin::from(self.client());
		let mode_cmd = ModeCommandResponse {
			origin: &origin,
			tags: ModeCommandResponse::<()>::default_tags(),
			added: umodes,
			removed: Default::default(),
			target: &self.user().nickname,
			updated: false,
		};

		self.emit(mode_cmd.name(), mode_cmd);
	}
}

impl<'a> Socket<'a>
{
	/// Émet au client les réponses liées à la commande /AWAY + /PRIVMSG
	pub fn send_rpl_away(&self, target_client_socket: &Self)
	{
		use crate::src::chat::features::RplAwayReply;

		let origin = Origin::from(target_client_socket.client());
		let message = target_client_socket.user().away_message();
		let rpl_away = RplAwayReply {
			origin: &origin,
			tags: RplAwayReply::default_tags(),
			message: &message,
			nick: &target_client_socket.user().nickname,
		};
		self.emit(rpl_away.name(), rpl_away);
	}

	/// Émet au client les réponses liées à la commande /IGNORE.
	pub fn send_rpl_ignore(&self, users: &[&components::Origin], updated: bool)
	{
		use crate::src::chat::features::RplIgnoreReply;

		let origin = Origin::from(self.client());
		let rpl_ignore = RplIgnoreReply {
			origin: &origin,
			users,
			tags: RplIgnoreReply::default_tags(),
			updated: &updated,
		};
		self.emit(rpl_ignore.name(), rpl_ignore);
	}

	/// Émet au client les réponses liées à la commande /LIST (2).
	pub fn send_rpl_list(&self, channel: &components::Channel)
	{
		use crate::src::chat::features::RplListReply;

		let origin = Origin::from(self.client());

		let mode_settings = channel.modes_settings.to_string();
		let topic = channel.topic_text();
		let total_members = channel.members().len();

		let rpl_list = RplListReply {
			origin: &origin,
			tags: RplListReply::default_tags(),
			channel: &channel.name,
			modes_settings: &mode_settings,
			topic,
			total_members: &total_members,
		};
		self.emit(rpl_list.name(), rpl_list);
	}

	/// Émet au client les réponses liées à la commande /LIST (3).
	pub fn send_rpl_listend(&self)
	{
		use crate::src::chat::features::RplListendReply;

		let origin = Origin::from(self.client());
		let rpl_listend = RplListendReply {
			origin: &origin,
			tags: RplListendReply::default_tags(),
		};
		self.emit(rpl_listend.name(), rpl_listend);
	}

	/// Émet au client les réponses liées à la commande /LIST (1).
	pub fn send_rpl_liststart(&self)
	{
		use crate::src::chat::features::RplListstartReply;

		let origin = Origin::from(self.client());
		let rpl_liststart = RplListstartReply {
			origin: &origin,
			tags: RplListstartReply::default_tags(),
		};
		self.emit(rpl_liststart.name(), rpl_liststart);
	}

	/// Émet au client les membres d'un salon par chunk de 300.
	pub fn send_rpl_namreply(
		&self,
		channel: &components::Channel,
		mut map_member: impl FnMut(
			&components::nick::ChannelNick,
		) -> Option<crate::src::chat::replies::ChannelNickClient>,
	)
	{
		use crate::src::chat::replies::{RplEndofnamesReply, RplNamreplyCommandResponse};

		let origin = Origin::from(self.client());
		let rpl_names = Vec::from_iter(channel.members());
		let rpl_names = rpl_names.chunks(300).map(|members| {
			RplNamreplyCommandResponse {
				origin: &origin,
				channel: channel.name.as_ref(),
				code: RplNamreplyCommandResponse::code(),
				users: members
					.iter()
					.filter_map(|(_, channel_nick)| map_member(channel_nick))
					.collect::<Vec<_>>(),
				tags: RplNamreplyCommandResponse::default_tags(),
			}
		});

		for rpl_name in rpl_names {
			_ = self
				.socket()
				.within(channel.room())
				.emit(rpl_name.name(), rpl_name);
		}

		let rpl_endofnames = RplEndofnamesReply {
			origin: &origin,
			channel: &channel.name,
			tags: RplEndofnamesReply::default_tags(),
		};
		_ = self
			.socket()
			.within(channel.room())
			.emit(rpl_endofnames.name(), rpl_endofnames);
	}

	/// Émet au client les réponses liées à la commande /AWAY.
	pub fn send_rpl_nowaway(&self)
	{
		use crate::src::chat::features::RplNowawayReply;

		let origin = Origin::from(self.client());
		let rpl_nowaway = RplNowawayReply {
			origin: &origin,
			tags: RplNowawayReply::default_tags(),
		};
		self.emit(rpl_nowaway.name(), rpl_nowaway);
	}

	/// Émet au client les réponses liées à la commande /AWAY.
	pub fn send_rpl_unaway(&self)
	{
		use crate::src::chat::features::RplUnawayReply;

		let origin = Origin::from(self.client());
		let rpl_nowaway = RplUnawayReply {
			origin: &origin,
			tags: RplUnawayReply::default_tags(),
		};
		self.emit(rpl_nowaway.name(), rpl_nowaway);
	}

	/// Émet au client le sujet du salon.
	pub fn send_rpl_topic(&self, channel: &components::channel::Channel, updated: bool)
	{
		use crate::src::chat::features::{RplNotopicReply, RplTopicReply};

		let origin = Origin::from(self.client());
		if channel.topic_text().is_empty() {
			let rpl_notopic = RplNotopicReply {
				origin: &origin,
				channel: &channel.name,
				tags: RplNotopicReply::default_tags(),
			};
			self.emit(rpl_notopic.name(), &rpl_notopic);

			if updated {
				_ = self
					.socket()
					.to(channel.room())
					.emit(rpl_notopic.name(), rpl_notopic);
			}
		} else {
			let rpl_topic = RplTopicReply {
				origin: &origin,
				channel: channel.name.as_ref(),
				topic: channel.topic_text(),
				updated: &updated,
				updated_by: channel.topic().updated_by(),
				updated_at: channel.topic().updated_at(),
				tags: RplTopicReply::default_tags(),
			};
			self.emit(rpl_topic.name(), &rpl_topic);

			if updated {
				_ = self
					.socket()
					.to(channel.room())
					.emit(rpl_topic.name(), rpl_topic);
			}
		};
	}

	/// Émet au client les réponses liées à la commande /UNIGNORE.
	pub fn send_rpl_unignore(&self, users: &[&components::Origin])
	{
		use crate::src::chat::features::RplUnignoreReply;

		let origin = Origin::from(self.client());
		let rpl_unignore = RplUnignoreReply {
			origin: &origin,
			users,
			tags: RplUnignoreReply::default_tags(),
		};
		self.emit(rpl_unignore.name(), rpl_unignore);
	}

	/// Émet au client les réponses liées à la commande /OPER.
	pub fn send_rpl_youreoper(&self, oper_type: components::user::Flag)
	{
		use crate::src::chat::replies::RplYoureoperReply;

		let origin = Origin::from(self.client());
		let rpl_youreoper = RplYoureoperReply {
			origin: &origin,
			tags: RplYoureoperReply::default_tags(),
			oper_type: &oper_type,
		};
		self.emit(rpl_youreoper.name(), rpl_youreoper);
	}

	/// Émet au client les réponses de connexion. 3) RPL_CREATED
	pub fn send_rpl_created(&self, created_at: time::DateTime<time::Utc>)
	{
		use crate::src::chat::replies::RplCreatedReply;

		let origin = components::Origin::from(self.client());
		let created_003 = RplCreatedReply {
			origin: &origin,
			date: &created_at,
			tags: RplCreatedReply::default_tags(),
		};

		self.emit(created_003.name(), created_003);
	}

	/// Émet au client les réponses de connexion. 2) RPL_YOURHOST
	pub fn send_rpl_yourhost(&self, servername: &str)
	{
		use crate::src::chat::replies::RplYourhostReply;

		let origin = components::Origin::from(self.client());
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
	pub fn send_rpl_welcome(&self)
	{
		use crate::src::chat::replies::RplWelcomeReply;

		let origin = components::Origin::from(self.client());
		let host = self.user().host.to_string();
		let welcome_001 = RplWelcomeReply {
			origin: &origin,
			nickname: &self.user().nickname,
			ident: &self.user().ident,
			host: &host,
			tags: RplWelcomeReply::default_tags(),
		}
		.with_tags([("client_id", self.client().cid())]);

		self.emit(welcome_001.name(), welcome_001);
	}
}

impl<'a> Socket<'a>
{
	pub fn send_err(&self, comment: impl ToString)
	{
		self.emit("ERROR", comment.to_string());
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrAlreadyregisteredError].
	pub fn send_err_alreadyregistered(&self)
	{
		use crate::src::chat::replies::ErrAlreadyregisteredError;

		let origin = Origin::from(self.client());
		let err_alreadyregistered = ErrAlreadyregisteredError {
			origin: &origin,
			tags: ErrAlreadyregisteredError::default_tags(),
		};

		self.emit(err_alreadyregistered.name(), err_alreadyregistered);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrBadchannelkeyError].
	pub fn send_err_badchannelkey(&self, channel: &str)
	{
		use crate::src::chat::replies::ErrBadchannelkeyError;

		let origin = Origin::from(self.client());
		let err_badchannelkey = ErrBadchannelkeyError {
			channel,
			tags: ErrBadchannelkeyError::default_tags(),
			origin: &origin,
		};
		self.emit(err_badchannelkey.name(), err_badchannelkey);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrCannotsendtochanError].
	pub fn send_err_cannotsendtochan(&self, channel_name: &str)
	{
		use crate::src::chat::replies::ErrCannotsendtochanError;

		let origin = Origin::from(self.client());
		let err_cannotsendtochan = ErrCannotsendtochanError {
			channel_name,
			origin: &origin,
			tags: ErrCannotsendtochanError::default_tags(),
		};
		self.emit(err_cannotsendtochan.name(), err_cannotsendtochan);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrChanoprivsneededError].
	pub fn send_err_chanoprivsneeded(&self, channel: &str)
	{
		use crate::src::chat::replies::ErrChanoprivsneededError;

		let origin = Origin::from(self.client());
		let err_chanoprivsneeded = ErrChanoprivsneededError {
			channel,
			origin: &origin,
			tags: ErrChanoprivsneededError::default_tags(),
		};
		self.emit(err_chanoprivsneeded.name(), err_chanoprivsneeded);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrErroneusnicknameError].
	pub fn send_err_erroneusnickname(&self, nickname: &str)
	{
		use crate::src::chat::replies::ErrErroneusnicknameError;

		let origin = Origin::from(self.client());
		let err_erroneusnickname = ErrErroneusnicknameError {
			origin: &origin,
			nickname,
			tags: ErrErroneusnicknameError::default_tags(),
		};

		self.emit(err_erroneusnickname.name(), err_erroneusnickname);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNicknameinuseError].
	pub fn send_err_nicknameinuse(&self, nickname: &str)
	{
		use crate::src::chat::replies::ErrNicknameinuseError;

		let origin = Origin::from(self.client());
		let err_nicknameinuse = ErrNicknameinuseError {
			origin: &origin,
			nickname,
			tags: ErrNicknameinuseError::default_tags(),
		};

		self.emit(err_nicknameinuse.name(), err_nicknameinuse);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNoprivilegesError].
	pub fn send_err_noprivileges(&self)
	{
		use crate::src::chat::replies::ErrNoprivilegesError;

		let origin = Origin::from(self.client());
		let err_noprivileges = ErrNoprivilegesError {
			origin: &origin,
			tags: ErrNoprivilegesError::default_tags(),
		};

		self.emit(err_noprivileges.name(), err_noprivileges);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNooperhostError].
	pub fn send_err_nooperhost(&self)
	{
		use crate::src::chat::replies::ErrNooperhostError;

		let origin = Origin::from(self.client());
		let err_nooperhost = ErrNooperhostError {
			origin: &origin,
			tags: ErrNooperhostError::default_tags(),
		};
		self.emit(err_nooperhost.name(), err_nooperhost);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrOperonlyError].
	pub fn send_err_operonly(&self, channel: &str)
	{
		use crate::src::chat::replies::ErrOperonlyError;

		let origin = Origin::from(self.client());
		let err_operonly = ErrOperonlyError {
			origin: &origin,
			channel,
			tags: ErrOperonlyError::default_tags(),
		};
		self.emit(err_operonly.name(), err_operonly);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrPasswdmismatch].
	pub fn send_err_passwdmismatch(&self)
	{
		use crate::src::chat::replies::ErrPasswdmismatchError;

		let origin = Origin::from(self.client());
		let err_passwdmismatch = ErrPasswdmismatchError {
			origin: &origin,
			tags: ErrPasswdmismatchError::default_tags(),
		};
		self.emit(err_passwdmismatch.name(), err_passwdmismatch);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNosuchchannelError].
	pub fn send_err_nosuchchannel(&self, channel_name: &str)
	{
		use crate::src::chat::replies::ErrNosuchchannelError;

		let origin = Origin::from(self.client());
		let err_nosuchchannel = ErrNosuchchannelError {
			origin: &origin,
			channel_name,
			tags: ErrNosuchchannelError::default_tags(),
		};
		self.emit(err_nosuchchannel.name(), err_nosuchchannel);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNosuchnickError].
	pub fn send_err_nosuchnick(&self, nickname: &str)
	{
		use crate::src::chat::replies::ErrNosuchnickError;

		let origin = Origin::from(self.client());
		let err_nosuchnick = ErrNosuchnickError {
			origin: &origin,
			nickname,
			tags: ErrNosuchnickError::default_tags(),
		};
		self.emit(err_nosuchnick.name(), err_nosuchnick);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrNotonchannelError].
	pub fn send_err_notonchannel(&self, channel: &str)
	{
		use crate::src::chat::replies::ErrNotonchannelError;

		let origin = Origin::from(self.client());
		let err_notonchannel = ErrNotonchannelError {
			origin: &origin,
			channel,
			tags: ErrNotonchannelError::default_tags(),
		};
		self.emit(err_notonchannel.name(), err_notonchannel);
	}

	/// Émet au client l'erreur
	/// [crate::src::chat::replies::ErrUsernotinchannelError].
	pub fn send_err_usernotinchannel(&self, channel: &str, nick: &str)
	{
		use crate::src::chat::replies::ErrUsernotinchannelError;

		let origin = Origin::from(self.client());
		let err_usernotinchannel = ErrUsernotinchannelError {
			origin: &origin,
			tags: ErrUsernotinchannelError::default_tags(),
			channel,
			nick,
		};

		self.emit(err_usernotinchannel.name(), err_usernotinchannel);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'a> ClientSocketInterface for Socket<'a>
{
	fn client(&self) -> &super::Client
	{
		match self {
			| Self::Owned { client, .. } => client,
			| Self::Borrowed { client, .. } => client,
			| Self::BorrowedMut { client, .. } => client,
		}
	}

	fn client_mut(&mut self) -> &mut super::Client
	{
		match self {
			| Self::BorrowedMut { client, .. } => client,
			| Self::Owned { .. } | Self::Borrowed { .. } => {
				panic!("Le client NE PEUT PAS être mutable")
			}
		}
	}

	fn disconnect(self)
	{
		_ = match self {
			| Self::Owned { socket, .. } => socket.disconnect(),
			| Self::Borrowed { .. } | Self::BorrowedMut { .. } => {
				panic!("Impossible de déconnecter cette socket.")
			}
		}
	}

	fn socket(&self) -> &socketioxide::extract::SocketRef
	{
		match self {
			| Self::Owned { socket, .. } => socket,
			| Self::Borrowed { socket, .. } => socket,
			| Self::BorrowedMut { socket, .. } => socket,
		}
	}

	fn user(&self) -> &crate::src::chat::components::User
	{
		&self.client().user
	}

	fn user_mut(&mut self) -> &mut crate::src::chat::components::user::User
	{
		&mut self.client_mut().user
	}
}
