<script setup lang="ts">
import { ButtonIcon, UiButton } from "@phisyx/flex-vue-uikit";
import { ref } from "vue";

import type { Room } from "@phisyx/flex-chat";

import vResize from "~/directives/resize";
import NavigationServer from "#/sys/navigation_server/NavigationServer.vue";

// -------- //
// Constant //
// -------- //

const DEFAULT_MAX_SIZE = 255;
const DEFAULT_MIN_SIZE = 42;

// ---- //
// Type //
// ---- //

interface Props {
	servers: Array<Server>;
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
	(evtName: "change-room", origin: Origin | RoomID): void;
	(evtName: "close-room", origin: Origin | RoomID): void;
	(evtName: "open-channel-list"): void;
	(evtName: "open-settings-view"): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

const folded = ref(false);
const navWidth = ref(
	folded.value ? `${DEFAULT_MIN_SIZE}px` : `${DEFAULT_MAX_SIZE}px`,
);

const changeRoom = (origin: Origin | RoomID) => emit("change-room", origin);
const closeRoom = (origin: Origin | RoomID) => emit("close-room", origin);
const openChannelList = () => emit("open-channel-list");
const openSettingsView = () => emit("open-settings-view");

function toggleNavigationHandler() {
	const navW = Number.parseInt(navWidth.value, 10);

	if (folded.value || navW < DEFAULT_MAX_SIZE / 2) {
		navWidth.value = `${DEFAULT_MAX_SIZE}px`;
	} else {
		navWidth.value = `${DEFAULT_MIN_SIZE}px`;
	}

	folded.value = !folded.value;
}

function resizeHandler(entries: Array<ResizeObserverEntry>) {
	const [entry] = entries;

	navWidth.value = `${entry.contentRect.width}px`;

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
		v-resize="resizeHandler"
		class="navigation-area [ flex:shrink=0 flex! select:none resize:x ]"
		:style="{ width: navWidth }"
	>
		<nav class="[ scroll:y flex:full size:full ]">
			<NavigationServer
				v-for="server in servers"
				:container-folded="folded"
				:key="server.name"
				v-bind="server"
				@change-room="changeRoom"
				@close-room="closeRoom"
			/>
		</nav>

		<footer class="[ flex gap=1 p=1 h=6 ]">
			<ButtonIcon
				:icon="folded ? 'arrow-right' : 'arrow-left'"
				@click="toggleNavigationHandler"
			/>

			<div
				v-show="!folded"
				class="[ flex:full flex flex/center:full gap=1 flex:shrink=0 ]"
				dir="ltr"
			>
				<UiButton
					id="goto-channel-list"
					icon="channel-list"
					:with-opacity="false"
					title="Liste des salons"
					@click="openChannelList"
				/>

				<ButtonIcon icon="settings" @click="openSettingsView" />
			</div>
		</footer>
	</section>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

section {
	min-width: fx.space(42);
	width: v-bind(navWidth);
	max-width: fx.space(255);
	order: var(--navigation-area-order, initial);
}
</style>
