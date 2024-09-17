<script setup lang="ts">
import type { PrivateView } from "@phisyx/flex-chat-ui/views/private";

import { computed } from "vue";

import Avatar from "#/api/avatar/Avatar.vue";
import PrivateRoomComponent from "#/sys/private_room/PrivateRoom.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	view: PrivateView;
}

// --------- //
// Composant //
// --------- //

const { view } = defineProps<Props>();

let current_client_user = computed(() => view.current_client_user);
let current_client_nickname = computed(() => view.current_client_nickname);
let recipient = computed(() => view.recipient);
let is_recipient_blocked = computed(() => view.is_recipient_blocked);
let completion_list = computed(() => view.completion_list);
let text_format_bold = computed(() => view.text_format.bold);
let text_format_italic = computed(() => view.text_format.italic);
let text_format_underline = computed(() => view.text_format.underline);
let text_colors_background = computed(() => view.text_colors.background);
let text_colors_foreground = computed(() => view.text_colors.foreground);
</script>

<template>
	<PrivateRoomComponent
		:completion-list="completion_list"
		:current-client-user="current_client_user"
		:current-nickname="current_client_nickname"
		:is-recipient-blocked="is_recipient_blocked"
		:recipient="recipient"
		:room="view.priv"
		:text-format-bold="text_format_bold"
		:text-format-italic="text_format_italic"
		:text-format-underline="text_format_underline"
		:text-color-background="text_colors_background"
		:text-color-foreground="text_colors_foreground"
		@change-nickname="view.open_change_nickname_dialog_handler"
		@close="view.close_handler"
		@ignore-user="view.send_ignore_user_command_handler"
		@open-colors-box="view.open_colors_box_handler"
		@open-room="view.open_room_handler"
		@send-message="view.send_message_handler"
		@unignore-user="view.send_unignore_user_command_handler"
	>
		<template #avatar="{ recipient }">
			<Avatar
				:key="recipient.id"
				:id="recipient.id"
				:alt="`Avatar du compte de ${recipient.nickname}.`"
			/>
		</template>
	</PrivateRoomComponent>
</template>
