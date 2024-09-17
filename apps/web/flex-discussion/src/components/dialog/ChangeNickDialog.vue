<script setup lang="ts">
import type { DialogView } from "@phisyx/flex-chat-ui/components/dialog";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	OverlayerStore,
	SettingsStore,
	UserStore,
} from "@phisyx/flex-chat/store";

import { DialogWireframe } from "@phisyx/flex-chat-ui/components/dialog";
import { UserChangeNicknameDialog } from "@phisyx/flex-chat/dialogs/user_change_nickname";
import { computed, reactive } from "vue";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
	use_user_store,
} from "~/store";

import ChangeNickDialog from "#/sys/dialog_change_nick/ChangeNickDialog.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let overlayer_store = use_overlayer_store().store;
let settings_store = use_settings_store().store;
let user_store = use_user_store().store;

let view = reactive(
	DialogWireframe.create(
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store as OverlayerStore,
		settings_store as SettingsStore,
		user_store as UserStore,
	) as DialogView,
);

view.define_dialog(UserChangeNicknameDialog);

let layer_name = computed(() => view.layer_name);
let teleport_id = computed(() => view.teleport_id);
</script>

<template>
	<Teleport defer :to="teleport_id">
		<ChangeNickDialog
			:layer-name="layer_name"
			@close="view.close_dialog"
			@submit="view.send_change_nick_command_handler"
		/>
	</Teleport>
</template>
