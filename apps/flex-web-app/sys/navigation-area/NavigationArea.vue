<script setup lang="ts">
import { ButtonIcon, UiButton } from "@phisyx/flex-uikit";

import { Room } from "~/room/Room";

import { folded, navWidth } from "./NavigationArea.state";
import {
	type Emits,
	changeRoom,
	closeRoom,
	openChannelList,
} from "./NavigationArea.handlers";

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
	id: string;
	name: string;
	rooms: Array<Room>;
}

// --------- //
// Composant //
// --------- //
defineProps<Props>();
const emit = defineEmits<Emits>();

const changeRoomHandler = changeRoom(emit);
const closeRoomHandler = closeRoom(emit);
const openChannelListHandler = openChannelList(emit);
</script>

<template>
	<section class="navigation-area [ flex! select:none ]">
		<nav class="[ scroll:y flex:full size:full ]">
			<NavigationServer
				v-for="server in servers"
				:container-folded="folded"
				:key="server.name"
				v-bind="server"
				@change-room="changeRoomHandler"
				@close-room="closeRoomHandler"
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
					@click="openChannelListHandler()"
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
