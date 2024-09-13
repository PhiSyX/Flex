<script setup lang="ts">
import type { ChannelRoom, ChannelView } from "@phisyx/flex-chat";

import { computed } from "vue";

import ChannelUserlistUserInfo from "#/api/channel_userlist_user_info/ChannelUserlistUserInfo.vue";
import ChannelRoomComponent from "#/sys/channel_room/ChannelRoom.template.vue";
import ChannelRoomKicked from "#/sys/channel_room/ChannelRoomKicked.vue";

// ---- //
// Type //
// ---- //

interface Props {
	// Le salon actif.
	room: ChannelRoom;
	view: ChannelView;
}

// --------- //
// Composant //
// --------- //

const { room, view } = defineProps<Props>();

let activities = computed(() => view.activities);
let completion_list = computed(() => view.completion_list);
let current_client_channel_member = computed(
	() => view.current_client_channel_member,
);
let current_client_user_nickname = computed(
	() => view.current_client_user_nickname,
);
let is_userlist_displayed = computed(() => view.is_userlist_displayed);
let position_userlist = computed(() => view.position_userlist);
let selected_member = computed(() => view.selected_member);
let text_format_bold = computed(() => view.text_format.bold);
let text_format_italic = computed(() => view.text_format.italic);
let text_format_underline = computed(() => view.text_format.underline);
let text_colors_background = computed(() => view.text_colors.background);
let text_colors_foreground = computed(() => view.text_colors.foreground);
</script>

<template>
	<ChannelRoomComponent
		:room="view.channel"
		:activities="activities"
		:completion-list="completion_list"
		:current-client-member="current_client_channel_member"
		:current-nickname="current_client_user_nickname"
		:selected-member="selected_member"
		:text-format-bold="text_format_bold"
		:text-format-italic="text_format_italic"
		:text-format-underline="text_format_underline"
		:text-color-background="text_colors_background"
		:text-color-foreground="text_colors_foreground"
		:userlist-displayed-by-default="is_userlist_displayed"
		@ban-member="view.send_ban_member_command_handler"
		@ban-nick="view.send_bannick_member_command_handler"
		@change-nickname="view.open_change_nickname_dialog_handler"
		@create-topic-layer="view.create_topic_layer_handler"
		@close="view.close_handler"
		@ignore-user="view.send_ignore_user_command_handler"
		@kick-member="view.send_kick_member_command"
		@open-channel-settings="view.open_channel_settings_dialog_handler"
		@open-menu-channel-options="view.open_channel_options_menu_handler"
		@open-colors-box="view.open_colors_box_handler"
		@open-room="view.open_room_handler"
		@open-private="view.open_private_handler"
		@select-member="view.toggle_select_channel_member_handler"
		@send-message="view.send_message_handler"
		@set-access-level="view.set_access_level_handler"
		@unban-member="view.send_unban_member_command_handler"
		@unban-nick="view.send_unbannick_member_command_handler"
		@unignore-user="view.send_unignore_user_command_handler"
		@unset-access-level="view.send_unset_access_level_handler"
		@update-topic="view.send_update_topic_handler"
		:style="{
			'--room-info-position': position_userlist,
		}"
	>
		<template #userlist-additional-info="{ member }">
			<ChannelUserlistUserInfo :user-id="member.id" privacy="public" />
		</template>

		<template v-if="view.channel.kicked" #history>
			<ChannelRoomKicked
				:last-message="room.last_message.unwrap()"
				@join-channel="view.rejoin_channel_command"
			/>
		</template>
	</ChannelRoomComponent>
</template>
