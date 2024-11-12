<script setup lang="ts">
import type { PrivateView } from "@phisyx/flex-chat-ui/views/private";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store/chat";
import type { OverlayerStore } from "@phisyx/flex-chat/store/overlayer";
import type { SettingsStore } from "@phisyx/flex-chat/store/settings";
import type { UserStore } from "@phisyx/flex-chat/store/user";

import { PrivateWireframe } from "@phisyx/flex-chat-ui/views/private";
import { computed, onActivated, onDeactivated, onMounted, reactive } from "vue";
import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";
import { VueRouter } from "~/router";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
	use_user_store,
} from "~/store";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let overlayer_store = use_overlayer_store().store;
let settings_store = use_settings_store().store;
let user_store = use_user_store().store;

let view = reactive(
	PrivateWireframe.create(
		new VueRouter(),
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store as OverlayerStore,
		settings_store as SettingsStore,
		user_store as UserStore,
	),
) as PrivateView;

let maybe_private = computed(() => view.maybe_private);

// ---------- //
// Life cycle //
// ---------- //

onMounted(() => {
	view.set_private_from_route_param();
});

onActivated(() => {
	view.initialize();
});

onDeactivated(() => {
	view.drop();
});
</script>

<template>
	<PrivateRoomComponent
		v-if="maybe_private.is_some()"
		:view="view"
		class="[ flex:full ]"
	/>
</template>
