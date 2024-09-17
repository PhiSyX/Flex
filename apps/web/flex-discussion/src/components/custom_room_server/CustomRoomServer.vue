<script setup lang="ts">
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	OverlayerStore,
	SettingsStore,
} from "@phisyx/flex-chat";
import type {
	CustomRoomServerView,
	CustomRoomServerViewProps,
} from "@phisyx/flex-chat-ui";

import { CustomRoomServerWireframe } from "@phisyx/flex-chat-ui";
import { computed, reactive } from "vue";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
} from "~/store";

import CustomRoomServer from "#/sys/custom_room_server/CustomRoomServer.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let overlayer_store = use_overlayer_store().store;
let settings_store = use_settings_store().store;

const { room } = defineProps<CustomRoomServerViewProps>();

let view = reactive(
	CustomRoomServerWireframe.create(
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store as OverlayerStore,
		settings_store as SettingsStore,
	),
) as CustomRoomServerView;

view.define_props({ room });

// L'URL du forum.
let forum_url = computed(() => view.forum_url);
// L'URL du vademecum.
let vademecum_url = computed(() => view.vademecum_url);

let completion_list = computed(() => view.completion_list);

let current_client_user_nickname = computed(
	() => view.current_client_user_nickname,
);

let text_format_bold = computed(() => view.text_format.bold);
let text_format_italic = computed(() => view.text_format.italic);
let text_format_underline = computed(() => view.text_format.underline);
let text_colors_background = computed(() => view.text_colors.background);
let text_colors_foreground = computed(() => view.text_colors.foreground);
</script>

<template>
	<CustomRoomServer
		v-if="room.is_active() && !room.is_closed()"
		:forum-url="forum_url"
		:vademecum-url="vademecum_url"
		:completion-list="completion_list"
		:current-nickname="current_client_user_nickname"
		:room="room"
		:text-format-bold="text_format_bold"
		:text-format-italic="text_format_italic"
		:text-format-underline="text_format_underline"
		:text-color-background="text_colors_background"
		:text-color-foreground="text_colors_foreground"
		class="[ flex:full ]"
		@change-nickname="view.open_change_nickname_dialog_handler"
		@open-colors-box="view.open_colors_box_handler"
		@open-room="view.open_room_handler"
		@send-message="view.send_message_handler"
	/>
</template>
