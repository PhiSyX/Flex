use socketioxide::extract::{Data, SocketRef, State};

use super::application::ModeChannelAccessControlApplicationInterface;
use super::client::ModeAccessControlClientSocketInterface;
use crate::src::chat::components::channel;
use crate::src::chat::features::{
	ModeChannelAccessLevelApplicationInterface,
	OperApplicationInterface,
};
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct BanHandler;
pub struct UnbanHandler;

// -------------- //
// Implémentation //
// -------------- //

impl BanHandler
{
	pub const COMMAND_NAME: &'static str = "BAN";

	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::BanCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel_name in data.channels {
			if !app.is_client_global_operator(&client_socket)
				&& !app.does_client_have_rights_on_channel(
					&client_socket,
					&channel_name,
					channel::mode::ChannelAccessLevel::HalfOperator,
				) {
				continue;
			}

			let updated: Vec<_> = data
				.masks
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
				.map(|mode| (channel::mode::CHANNEL_MODE_LIST_BAN, mode))
				.collect();

			client_socket.emit_mode_access_control(&channel, added_flags, vec![], true);
		}
	}
}

impl UnbanHandler
{
	pub const COMMAND_NAME: &'static str = "UNBAN";

	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::UnbanCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel_name in data.channels {
			if !app.is_client_global_operator(&client_socket)
				&& !app.does_client_have_rights_on_channel(
					&client_socket,
					&channel_name,
					channel::mode::ChannelAccessLevel::HalfOperator,
				) {
				continue;
			}

			let updated: Vec<_> = data
				.masks
				.iter()
				.filter_map(|mask| app.apply_unban_for_channel(&client_socket, &channel_name, mask))
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
				.map(|mode| (channel::mode::CHANNEL_MODE_LIST_BAN, mode))
				.collect();

			client_socket.emit_mode_access_control(&channel, vec![], removed_flags, true);
		}
	}
}
