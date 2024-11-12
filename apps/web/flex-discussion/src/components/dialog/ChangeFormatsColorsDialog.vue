<script setup lang="ts">
import type { DialogView } from "@phisyx/flex-chat-ui/components/dialog";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store/chat";
import type { OverlayerStore } from "@phisyx/flex-chat/store/overlayer";
import type { SettingsStore } from "@phisyx/flex-chat/store/settings";
import type { UserStore } from "@phisyx/flex-chat/store/user";

import { DialogWireframe } from "@phisyx/flex-chat-ui/components/dialog";
import { ChangeFormatsColorsDialog } from "@phisyx/flex-chat/dialogs/change_formats_colors";
import vMutation from "@phisyx/flex-vue-directives/v-mutation";
import { computed, reactive } from "vue";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
	use_user_store,
} from "~/store";

import ChangeFormatsColorsDialogComponent from "#/sys/dialog_change_formats_colors/ChangeFormatsColorsDialog.template.vue";

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

view.define_dialog(ChangeFormatsColorsDialog);

let teleport_id = computed(() => view.teleport_id);
</script>

<template>
	<Teleport defer :to="teleport_id">
		<ChangeFormatsColorsDialogComponent
			v-model:bold="view.text_format.bold"
			v-model:italic="view.text_format.italic"
			v-model:underline="view.text_format.underline"
			v-model:background="view.text_colors.background"
			v-model:foreground="view.text_colors.foreground"
			v-mutation:opt.attributes.children="view.update_dialog"
		/>
	</Teleport>
</template>
