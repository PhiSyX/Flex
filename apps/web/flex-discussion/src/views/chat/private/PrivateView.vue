<script setup lang="ts">
import {
	type ChatStoreInterface,
	type ChatStoreInterfaceExt,
	type OverlayerStore,
	type PrivateView,
	PrivateWireframe,
	type SettingsStore,
} from "@phisyx/flex-chat";

import { computed, onActivated, onDeactivated, onMounted, reactive } from "vue";

import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
} from "~/store";

import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";
import { VueRouter } from "~/router";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let overlayer_store = use_overlayer_store().store;
let settings_store = use_settings_store().store;

let view = reactive(
	PrivateWireframe.create(
		new VueRouter(),
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store as OverlayerStore,
		settings_store as SettingsStore,
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
