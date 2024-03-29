use flex_chat_channel::{ChannelAccessLevel, CHANNEL_MODE_LIST_BAN, CHANNEL_MODE_LIST_BAN_EXCEPT};
use flex_chat_client_channel::ChannelClientSocketErrorReplies;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::mode::{
	BanCommandFormData,
	ModeAccessControlClientSocketCommandResponseInterface,
	UnbanCommandFormData,
};
use crate::features::chat::{
	ModeChannelAccessControlApplicationInterface,
	ModeChannelAccessLevelApplicationInterface,
	OperApplicationInterface,
};
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct ModeChannelAccessControlBanHandler;
pub struct ModeChannelAccessControlBanExceptionHandler;

// -------------- //
// Implémentation //
// -------------- //

impl ModeChannelAccessControlBanHandler
{
	pub const SET_COMMAND_NAME: &'static str = "BAN";

	pub fn handle_set(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<BanCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel_name in data.channels {
			if
				!app.is_client_global_operator(&client_socket) &&
				!app.does_client_have_rights_on_channel(
					&client_socket,
					&channel_name,
					ChannelAccessLevel::HalfOperator,
				)
			{
				continue;
			}

			let updated: Vec<_> = data.masks
				.iter()
				.filter_map(|mask| app.apply_ban_on_channel(&client_socket, &channel_name, mask))
				.collect();

			if updated.is_empty() {
				continue;
			}

			let Some(channel) = app.get_channel(&channel_name) else {
				client_socket.send_err_notonchannel(&channel_name);
				continue;
			};

			let added_flags = updated
				.into_iter()
				.map(|mode| (CHANNEL_MODE_LIST_BAN, mode))
				.collect();

			client_socket.emit_channel_access_control(&channel, added_flags, vec![], true);
		}
	}
}

impl ModeChannelAccessControlBanHandler
{
	pub const UNSET_COMMAND_NAME: &'static str = "UNBAN";

	pub fn handle_unset(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<UnbanCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel_name in data.channels {
			if
				!app.is_client_global_operator(&client_socket) &&
				!app.does_client_have_rights_on_channel(
					&client_socket,
					&channel_name,
					ChannelAccessLevel::HalfOperator,
				)
			{
				continue;
			}

			let updated: Vec<_> = data.masks
				.iter()
				.filter_map(|mask| app.apply_unban_on_channel(&client_socket, &channel_name, mask))
				.collect();

			if updated.is_empty() {
				continue;
			}

			let Some(channel) = app.get_channel(&channel_name) else {
				client_socket.send_err_notonchannel(&channel_name);
				continue;
			};

			let removed_flags = updated
				.into_iter()
				.map(|mode| (CHANNEL_MODE_LIST_BAN, mode))
				.collect();

			client_socket.emit_channel_access_control(&channel, vec![], removed_flags, true);
		}
	}
}

impl ModeChannelAccessControlBanExceptionHandler
{
	pub const SET_COMMAND_NAME: &'static str = "BANEX";

	pub async fn handle_set(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<BanCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel_name in data.channels {
			if
				!app.is_client_global_operator(&client_socket) &&
				!app.does_client_have_rights_on_channel(
					&client_socket,
					&channel_name,
					ChannelAccessLevel::HalfOperator,
				)
			{
				continue;
			}

			let updated: Vec<_> = data.masks
				.iter()
				.filter_map(|mask| {
					app.apply_ban_except_on_channel(&client_socket, &channel_name, mask)
				})
				.collect();

			if updated.is_empty() {
				continue;
			}

			let Some(channel) = app.get_channel(&channel_name) else {
				client_socket.send_err_notonchannel(&channel_name);
				continue;
			};

			let added_flags = updated
				.into_iter()
				.map(|mode| (CHANNEL_MODE_LIST_BAN_EXCEPT, mode))
				.collect();

			client_socket.emit_channel_access_control(&channel, added_flags, vec![], true);
		}
	}
}

impl ModeChannelAccessControlBanExceptionHandler
{
	pub const UNSET_COMMAND_NAME: &'static str = "UNBANEX";

	pub async fn handle_unset(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<UnbanCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel_name in data.channels {
			if
				!app.is_client_global_operator(&client_socket) &&
				!app.does_client_have_rights_on_channel(
					&client_socket,
					&channel_name,
					ChannelAccessLevel::HalfOperator,
				)
			{
				continue;
			}

			let updated: Vec<_> = data.masks
				.iter()
				.filter_map(|mask| {
					app.apply_unban_except_on_channel(&client_socket, &channel_name, mask)
				})
				.collect();

			if updated.is_empty() {
				continue;
			}

			let Some(channel) = app.get_channel(&channel_name) else {
				client_socket.send_err_notonchannel(&channel_name);
				continue;
			};

			let removed_flags = updated
				.into_iter()
				.map(|mode| (CHANNEL_MODE_LIST_BAN_EXCEPT, mode))
				.collect();

			client_socket.emit_channel_access_control(&channel, vec![], removed_flags, true);
		}
	}
}
