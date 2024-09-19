<script setup lang="ts">
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store/chat";
import type { OverlayerStore } from "@phisyx/flex-chat/store/overlayer";
import type { SettingsStore } from "@phisyx/flex-chat/store/settings";
import type { UserStore } from "@phisyx/flex-chat/store/user";

import type { MenuView } from "@phisyx/flex-chat-ui/components/menu";
import type { PrivateOptionsRecordMenu } from "@phisyx/flex-chat/menu/private_options";
import type { ComputedRef } from "vue";

import { MenuWireframe } from "@phisyx/flex-chat-ui/components/menu";
import { PrivateOptionsMenu } from "@phisyx/flex-chat/menu/private_options";
import { computed, reactive } from "vue";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
	use_user_store,
} from "~/store";

import PrivateOptionsMenuComponent from "#/sys/menu_private_options/PrivateOptionsMenu.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let overlayer_store = use_overlayer_store().store;
let settings_store = use_settings_store().store;
let user_store = use_user_store().store;

let view = reactive(
	MenuWireframe.create(
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store as OverlayerStore,
		settings_store as SettingsStore,
		user_store as UserStore,
	) as MenuView,
);

view.define_menu(PrivateOptionsMenu);

let layer_name = computed(() => view.layer_name);
let teleport_id = computed(() => view.teleport_id);
let has_data = computed(() => view.has_data);
let data: ComputedRef<PrivateOptionsRecordMenu> = computed(() => view.data);
</script>

<template>
	<Teleport v-if="has_data" defer :to="teleport_id">
		<PrivateOptionsMenuComponent
			:layer-name="layer_name"
			v-bind="data"
			@open-update-account="view.open_update_account_dialog_handler"
			@close="view.close_room_handler"
		/>
	</Teleport>
</template>
