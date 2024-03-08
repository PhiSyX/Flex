<script setup lang="ts">
import { ButtonIcon, UiButton } from "@phisyx/flex-uikit";
import { computed, ref } from "vue";

import type { Room } from "~/room/Room";

import NavigationServer from "#/sys/navigation-server/NavigationServer.vue";

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
}

// --------- //
// Composant //
// --------- //
defineProps<Props>();
const emit = defineEmits<Emits>();

const folded = ref(false);
const navWidth = computed(() => (folded.value ? "42px" : "255px"));

const changeRoom = (origin: Origin | RoomID) => emit("change-room", origin);
const closeRoom = (origin: Origin | RoomID) => emit("close-room", origin);
const openChannelList = () => emit("open-channel-list");
</script>

<template>
	<section class="navigation-area [ flex! select:none ]">
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
				@click="folded = !folded"
			/>

			<div
				v-show="!folded"
				class="[ flex:full flex flex/center:full gap=1 ]"
			>
				<UiButton
					id="goto-channel-list"
					icon="channel-list"
					:with-opacity="false"
					title="Liste des salons"
					@click="openChannelList"
				/>

				<ButtonIcon icon="settings" disabled title="TODO" />
			</div>
		</footer>
	</section>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

section {
	min-width: v-bind(navWidth);
	width: v-bind(navWidth);
	max-width: fx.space(255);
}
</style>
