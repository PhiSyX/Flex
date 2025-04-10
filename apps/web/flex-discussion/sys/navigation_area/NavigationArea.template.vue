<script setup lang="ts">
import type { Room } from "@phisyx/flex-chat/room";

import vResize from "@phisyx/flex-vue-directives/v-resize";
import { ref } from "vue";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";

import NavigationServer from "#/sys/navigation_server/NavigationServer.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	servers: Array<Server>;
	totalPrivatesWaiting?: number;
}

interface Server {
	active: boolean;
	connected: boolean;
	folded: boolean;
	id: CustomRoomID;
	name: CustomRoomID;
	rooms: Array<Room>;
}

interface Emits {
	(event_name: "change-room", origin: Origin | RoomID): void;
	(event_name: "close-room", origin: Origin | RoomID): void;
	(event_name: "open-channel-list"): void;
	(event_name: "open-private-list"): void;
	(event_name: "open-settings-view"): void;
}

// -------- //
// Constant //
// -------- //

const DEFAULT_MAX_SIZE = 255;
const DEFAULT_MIN_SIZE = 42;

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

let folded = ref(false);
let nav_width_ref = ref(
	folded.value ? `${DEFAULT_MIN_SIZE}px` : `${DEFAULT_MAX_SIZE}px`,
);

// ------- //
// Handler //
// ------- //

const change_room_handler = (origin: Origin | RoomID) =>
	emit("change-room", origin);
const close_room_handler = (origin: Origin | RoomID) =>
	emit("close-room", origin);
const open_channel_list_handler = () => emit("open-channel-list");
const open_private_list_handler = () => emit("open-private-list");
const open_settings_view_handler = () => emit("open-settings-view");

function toggle_navigation_handler() {
	let nav_width = Number.parseInt(nav_width_ref.value, 10);

	if (folded.value || nav_width < DEFAULT_MAX_SIZE / 2) {
		nav_width_ref.value = `${DEFAULT_MAX_SIZE}px`;
	} else {
		nav_width_ref.value = `${DEFAULT_MIN_SIZE}px`;
	}

	folded.value = !folded.value;
}

function resize_handler(entries: Array<ResizeObserverEntry>) {
	let [entry] = entries;

	nav_width_ref.value = `${entry.contentRect.width}px`;

	if (folded.value && entry.contentRect.width <= DEFAULT_MAX_SIZE) {
		folded.value = false;
	}

	if (!folded.value && entry.contentRect.width <= DEFAULT_MIN_SIZE) {
		folded.value = true;
	}
}
</script>

<template>
	<section
		v-resize="resize_handler"
		class="navigation-area [ flex:shrink=0 flex! select:none resize:x ]"
		:style="{ width: nav_width_ref }"
	>
		<nav class="[ scroll:y flex:full size:full ]">
			<NavigationServer
				v-for="server in servers"
				:container-folded="folded"
				:key="server.name"
				v-bind="server"
				@change-room="change_room_handler"
				@close-room="close_room_handler"
			/>
		</nav>

		<footer class="[ flex gap=1 p=1 ]">
			<Button
				:icon="folded ? 'arrow-right' : 'arrow-left'"
				:title="(folded ? 'Élargir' : 'Réduire') + ' la barre de navigation'"
				@click="toggle_navigation_handler"
			/>

			<div
				v-show="!folded"
				class="[ flex:full flex flex/center:full gap=1 flex:shrink=0 ]"
				dir="ltr"
			>
				<Button
					v-if="totalPrivatesWaiting"
					id="goto-private-list"
					icon="messages"
					:icon-attrs="{ unread: totalPrivatesWaiting }"
					@click="open_private_list_handler"
					title="Liste des privés en attente"
				/>

				<Button
					id="goto-channel-list"
					icon="channel-list"
					:with-opacity="false"
					title="Liste des salons"
					@click="open_channel_list_handler"
				/>

				<Button
					icon="settings"
					title="Paramètres globaux du Chat"
					@click="open_settings_view_handler"
				/>
			</div>
		</footer>
	</section>
</template>

<style scoped lang="scss">
@use "@phisyx/flexsheets" as fx;

section {
	min-width: fx.space(42);
	width: v-bind(nav_width_ref);
	max-width: fx.space(255);
	order: var(--navigation-area-order, initial);
}
</style>
